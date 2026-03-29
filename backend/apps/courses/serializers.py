"""
Serializers para cursos y favoritos.
"""
from rest_framework import serializers
from .models import Course, Favorite, UserInteraction


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = (
            'id', 'title', 'description', 'platform', 'instructor',
            'category', 'level', 'rating', 'url', 'image_url', 'created_at',
        )


class FavoriteSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    # Entrada para el POST (el frontend envía course: <id>)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        source='course',
        write_only=True,
    )

    class Meta:
        model = Favorite
        fields = ('id', 'user', 'course', 'course_id', 'created_at')
        read_only_fields = ('user', 'created_at', 'course')

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        # Por source='course', el course_id se mapea a validated_data['course']
        course = validated_data['course']
        favorite, created = Favorite.objects.get_or_create(
            user=user,
            course=course,
            defaults={'user': user, 'course': course},
        )
        if created:
            UserInteraction.objects.get_or_create(
                user=user,
                course=course,
                interaction_type='favorite',
                defaults={'user': user, 'course': course, 'interaction_type': 'favorite'},
            )
        return favorite
