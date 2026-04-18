from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Challenge, Submission


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )


class SubmissionSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    loves = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = [
            "id",
            "github_link",
            "user_name",
            "created_at",
            "likes",
            "loves",
        ]

    def get_user_name(self, obj):
        return obj.user.username if obj.user else "anonymous"

    def get_likes(self, obj):
        return obj.reactions.filter(reaction="like").count()

    def get_loves(self, obj):
        return obj.reactions.filter(reaction="love").count()


class SubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ["challenge", "github_link"]


class ChallengeSerializer(serializers.ModelSerializer):
    submissions = SubmissionSerializer(many=True, read_only=True)

    class Meta:
        model = Challenge
        fields = [
            "id",
            "title",
            "description",
            "difficulty",
            "created_at",
            "submissions",
        ]