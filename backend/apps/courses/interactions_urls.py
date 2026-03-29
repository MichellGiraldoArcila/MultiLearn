from django.urls import path
from .interactions_views import UserInteractionCreateView

urlpatterns = [
    path('', UserInteractionCreateView.as_view(), name='interaction_create'),
]
