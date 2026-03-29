from django.contrib import admin
from .models import Course, Favorite, UserInteraction


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'platform', 'category', 'level', 'rating', 'created_at')
    list_filter = ('platform', 'category', 'level')
    search_fields = ('title', 'description', 'instructor')


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'created_at')
    list_filter = ('user',)


@admin.register(UserInteraction)
class UserInteractionAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'interaction_type', 'created_at')
    list_filter = ('interaction_type', 'user',)
