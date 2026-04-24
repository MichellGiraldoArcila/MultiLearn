from django.urls import path
from .views import RecommendationsView, LearningRoadmapView

urlpatterns = [
    path('', RecommendationsView.as_view(), name='recommendations'),
    path('roadmap/', LearningRoadmapView.as_view(), name='learning_roadmap'),
]
