"""
Serializers para registro, perfil y login (JWT) de usuario.
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Hace el login compatible con `email`.

    Nota: en tu configuración (AUTH_USER_MODEL con USERNAME_FIELD='email') el
    `TokenObtainPairSerializer` ya espera campos `email` y `password`.
    Este serializer se mantiene como compatibilidad adicional, pero sin asumir
    que existe un campo `username` (evita KeyError).
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Compatibilidad: si SimpleJWT estuviera usando 'username', lo renombramos.
        if 'username' in self.fields and 'email' not in self.fields:
            self.fields['email'] = self.fields.pop('username')

    def validate(self, attrs):
        # Compatibilidad adicional: si llega 'username', lo convertimos a 'email'.
        if 'email' not in attrs and 'username' in attrs:
            attrs['email'] = attrs.pop('username')
        return super().validate(attrs)


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password', 'interests')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            interests=validated_data.get('interests', []),
        )
        return user

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Ya existe un usuario con este email.')
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'interests', 'created_at')
        read_only_fields = ('email', 'created_at')


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

        # Ejecuta validadores de Django (min length, common password, etc.)
        validate_password(new_password, user=user)
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    """
    Implementación funcional para la pantalla /reset-password.

    Nota: en un sistema productivo se recomienda token/email-verification.
    Aquí se hace un reset directo para que el flujo sea funcional.
    """
    email = serializers.EmailField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        email = attrs.get('email') or ''
        new_password = attrs.get('new_password') or ''
        confirm_password = attrs.get('confirm_password') or ''

        # Reglas adicionales (alineadas con el frontend)
        has_upper = any(c.isupper() for c in new_password)
        has_special = any(not c.isalnum() for c in new_password)

        if not has_upper:
            raise serializers.ValidationError({'new_password': 'Debe incluir al menos 1 mayúscula.'})
        if not has_special:
            raise serializers.ValidationError({'new_password': 'Debe incluir al menos 1 carácter especial.'})
        if new_password != confirm_password:
            raise serializers.ValidationError({'confirm_password': 'Las contraseñas no coinciden.'})

        # Si el email no existe, informamos.
        if not User.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'No existe una cuenta con este email.'})

        # Ejecuta validadores de Django (opcional, pero mantiene consistencia)
        user = User.objects.get(email=email)
        validate_password(new_password, user=user)
        return attrs
