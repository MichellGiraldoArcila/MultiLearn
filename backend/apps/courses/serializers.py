"""
Serializers para cursos y favoritos.
"""
from urllib.parse import urlparse

from rest_framework import serializers

from .models import Course, Favorite, UserInteraction

_VIDEO_HOST_FRAGMENTS = ('youtube.com', 'youtu.be', 'vimeo.com')


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = (
            'id',
            'title',
            'description',
            'platform',
            'instructor',
            'category',
            'level',
            'rating',
            'url',
            'image_url',
            'video_url',
            'created_at',
        )

    def validate_rating(self, value):
        if value is None:
            return value
        v = float(value)
        if v < 0 or v > 5:
            raise serializers.ValidationError('La valoración debe estar entre 0 y 5.')
        return value

    def validate_video_url(self, value):
        if value is None or str(value).strip() == '':
            return ''
        url = str(value).strip()
        parsed = urlparse(url)
        if parsed.scheme not in ('http', 'https'):
            raise serializers.ValidationError('El vídeo debe ser una URL http o https.')
        host = (parsed.netloc or '').lower()
        if not any(fragment in host for fragment in _VIDEO_HOST_FRAGMENTS):
            raise serializers.ValidationError(
                'Usa un enlace de YouTube (youtube.com o youtu.be) o Vimeo.'
            )
        return url


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
