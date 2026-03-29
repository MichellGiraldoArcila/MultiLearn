"""
URLs de autenticación.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, MeView, ChangePasswordView, ResetPasswordView

urlpatterns = [
    path('register', RegisterView.as_view(), name='auth_register'),
    path('login', LoginView.as_view(), name='auth_login'),
    path('refresh', TokenRefreshView.as_view(), name='auth_refresh'),
    path('me', MeView.as_view(), name='auth_me'),
    path('change-password', ChangePasswordView.as_view(), name='auth_change_password'),
    path('reset-password', ResetPasswordView.as_view(), name='auth_reset_password'),
]
