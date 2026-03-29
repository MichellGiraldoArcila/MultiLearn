"""
Vistas de autenticación: registro, login (JWT), refresh.
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import (
    UserRegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    ResetPasswordSerializer,
)
from rest_framework.permissions import AllowAny


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register - Registrar nuevo usuario."""
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'id': user.id, 'name': user.name, 'email': user.email},
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """POST /api/auth/login - Iniciar sesión (body: email, password). Devuelve access + refresh token."""
    serializer_class = CustomTokenObtainPairSerializer


class RefreshView(TokenRefreshView):
    """POST /api/auth/refresh - Refrescar access token."""


class MeView(generics.RetrieveAPIView):
    """GET /api/auth/me - Devuelve el perfil del usuario autenticado."""
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    """POST /api/auth/change-password - Cambia la contraseña del usuario."""
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        new_password = serializer.validated_data['new_password']
        user.set_password(new_password)
        user.save(update_fields=['password'])
        return Response({'detail': 'Contraseña actualizada.'}, status=status.HTTP_200_OK)


class ResetPasswordView(generics.GenericAPIView):
    """POST /api/auth/reset-password - Reinicia la contraseña por email."""
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        new_password = serializer.validated_data['new_password']

        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save(update_fields=['password'])
        return Response({'detail': 'Contraseña actualizada correctamente.'}, status=status.HTTP_200_OK)
