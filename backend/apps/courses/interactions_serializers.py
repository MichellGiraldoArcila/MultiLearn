from rest_framework import serializers
from .models import UserInteraction, Course


class UserInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInteraction
        fields = ('id', 'user', 'course', 'interaction_type', 'created_at')
        read_only_fields = ('user', 'created_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def validate_interaction_type(self, value):
        if value not in ('view', 'favorite', 'click'):
            raise serializers.ValidationError(
                'interaction_type debe ser: view, favorite o click.'
            )
        return value
