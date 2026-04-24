"""
Serializers para registro, perfil y login (JWT) de usuario.
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django.contrib.auth.password_validation import validate_password

from .models import User
from .preferences_schema import (
    ALLOWED_INTEREST_TAGS,
    ALLOWED_LEVELS,
    default_preferences,
)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Hace el login compatible con `email`.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if 'username' in self.fields and 'email' not in self.fields:
            self.fields['email'] = self.fields.pop('username')

    def validate(self, attrs):
        if 'email' not in attrs and 'username' in attrs:
            attrs['email'] = attrs.pop('username')
        return super().validate(attrs)


class PreferencesSerializer(serializers.Serializer):
    """Validación del objeto `preferences` en User."""

    interests = serializers.ListField(
        child=serializers.CharField(max_length=40),
        max_length=12,
        required=False,
        default=list,
    )
    level = serializers.CharField(max_length=20, allow_blank=True, required=False, default='')
    goal = serializers.CharField(max_length=280, allow_blank=True, required=False, default='')

    def validate_interests(self, value):
        cleaned = []
        for tag in value:
            t = str(tag).lower().strip()
            if not t:
                continue
            if t not in ALLOWED_INTEREST_TAGS:
                raise serializers.ValidationError(
                    f'Interés no permitido: {tag}. Opciones: {", ".join(sorted(ALLOWED_INTEREST_TAGS))}'
                )
            cleaned.append(t)
        return list(dict.fromkeys(cleaned))

    def validate_level(self, value):
        v = (value or '').strip().lower()
        if v not in ALLOWED_LEVELS:
            raise serializers.ValidationError('Nivel inválido.')
        return v


def normalize_preferences_dict(data):
    if data is None:
        return default_preferences()
    ser = PreferencesSerializer(data=data)
    ser.is_valid(raise_exception=True)
    out = default_preferences()
    out.update(ser.validated_data)
    return out


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    preferences = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password', 'preferences')

    def validate(self, attrs):
        user = User(email=attrs.get('email', ''), name=attrs.get('name', ''))
        validate_password(attrs['password'], user=user)
        prefs = attrs.get('preferences')
        if prefs is not None:
            attrs['preferences'] = normalize_preferences_dict(prefs)
        return attrs

    def create(self, validated_data):
        prefs = validated_data.pop('preferences', None)
        if prefs is None:
            prefs = default_preferences()
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            preferences=prefs,
        )
        return user

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Ya existe un usuario con este email.')
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    preferences = serializers.JSONField(required=False)

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'preferences', 'created_at', 'is_staff')
        read_only_fields = ('email', 'created_at', 'is_staff')

    def validate_preferences(self, value):
        merged = dict(default_preferences())
        if getattr(self.instance, 'pk', None):
            merged.update(self.instance.preferences or {})
        if isinstance(value, dict):
            merged.update(value)
        return normalize_preferences_dict(merged)

    def update(self, instance, validated_data):
        from apps.recommendations.cache import invalidate_cache_for_user

        out = super().update(instance, validated_data)
        invalidate_cache_for_user(instance.id)
        return out


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        user = self.context['request'].user
        current_password = attrs.get('current_password') or ''
        new_password = attrs.get('new_password') or ''
        confirm_password = attrs.get('confirm_password') or ''

        if not user.check_password(current_password):
            raise serializers.ValidationError({'current_password': 'La contraseña actual es incorrecta.'})

        if new_password != confirm_password:
            raise serializers.ValidationError({'confirm_password': 'Las contraseñas no coinciden.'})

        validate_password(new_password, user=user)
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    """
    Implementación funcional para la pantalla /reset-password.
    """

    email = serializers.EmailField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        email = attrs.get('email') or ''
        new_password = attrs.get('new_password') or ''
        confirm_password = attrs.get('confirm_password') or ''

        has_upper = any(c.isupper() for c in new_password)
        has_special = any(not c.isalnum() for c in new_password)

        if not has_upper:
            raise serializers.ValidationError({'new_password': 'Debe incluir al menos 1 mayúscula.'})
        if not has_special:
            raise serializers.ValidationError({'new_password': 'Debe incluir al menos 1 carácter especial.'})
        if new_password != confirm_password:
            raise serializers.ValidationError({'confirm_password': 'Las contraseñas no coinciden.'})

        if not User.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'No existe una cuenta con este email.'})

        user = User.objects.get(email=email)
        validate_password(new_password, user=user)
        return attrs
