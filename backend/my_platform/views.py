from datetime import timedelta
from urllib.parse import urlparse

from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import Challenge, Submission, SubmissionReaction
from .serializer import (
    ChallengeSerializer,
    RegisterSerializer,
    SubmissionSerializer,
    SubmissionCreateSerializer,
)
def homepage(request):
    return JsonResponse({"message": "Welcome to the homepage!"})


def is_valid_github_url(url):
    try:
        parsed = urlparse(url)

        if parsed.hostname not in ["github.com", "www.github.com"]:
            return False

        path_parts = [p for p in parsed.path.split("/") if p]
        return len(path_parts) >= 2
    except Exception:
        return False


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"}, status=201)

    return Response(serializer.errors, status=400)


@api_view(["GET"])
def get_challenges(request):
    challenges = Challenge.objects.all().order_by("-created_at")
    serializer = ChallengeSerializer(challenges, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_submission(request):
    github_link = request.data.get("github_link")

    if not github_link or not is_valid_github_url(github_link):
        return Response({"error": "Invalid GitHub link"}, status=400)

    serializer = SubmissionCreateSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({"message": "Submission saved successfully"}, status=201)

    return Response(serializer.errors, status=400)

@api_view(["POST"])
def react_submission(request, id):
    user_name = request.data.get("user_name")
    reaction_type = request.data.get("reaction")

    if not user_name:
        return Response({"error": "user_name is required"}, status=400)

    if reaction_type not in ["like", "love"]:
        return Response({"error": "reaction must be 'like' or 'love'"}, status=400)

    try:
        submission = Submission.objects.get(id=id)
    except Submission.DoesNotExist:
        return Response({"error": "Submission not found"}, status=404)

    existing_reaction = SubmissionReaction.objects.filter(
        submission=submission,
        user_name=user_name,
    ).first()

    current_reaction = None

    if existing_reaction:
        if existing_reaction.reaction == reaction_type:
            existing_reaction.delete()
        else:
            existing_reaction.reaction = reaction_type
            existing_reaction.save()
            current_reaction = reaction_type
    else:
        SubmissionReaction.objects.create(
            submission=submission,
            user_name=user_name,
            reaction=reaction_type,
        )
        current_reaction = reaction_type

    return Response({
        "reaction": current_reaction,
        "likes": submission.reactions.filter(reaction="like").count(),
        "loves": submission.reactions.filter(reaction="love").count(),
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def like_submission(request, submission_id):
    user_name = request.user.username

    try:
        submission = Submission.objects.get(id=submission_id)
    except Submission.DoesNotExist:
        return Response({"error": "Submission not found"}, status=404)

    reaction, created = SubmissionReaction.objects.get_or_create(
        submission=submission,
        user_name=user_name,
        defaults={"reaction": "like"},
    )

    if not created:
        reaction.delete()

    likes = SubmissionReaction.objects.filter(
        submission=submission,
        reaction="like",
    ).count()

    return Response({"likes": likes})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    user = request.user
    today = timezone.now().date()

    # Prefer real relation if Submission has a user field
    if hasattr(Submission, "user"):
        user_submissions = Submission.objects.filter(user=user).select_related("challenge")
    else:
        # fallback for older schema using only text username
        user_submissions = Submission.objects.filter(
            user_name=user.username
        ).select_related("challenge")

    total_submissions = user_submissions.count()

    total_likes = SubmissionReaction.objects.filter(
        submission__in=user_submissions,
        reaction="like",
    ).count()

    weekly_activity = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = user_submissions.filter(created_at__date=day).count()

        weekly_activity.append({
            "day": day.strftime("%a"),
            "date": day.isoformat(),
            "count": count,
        })

    streak = 0
    for i in range(0, 365):
        day = today - timedelta(days=i)
        has_submission = user_submissions.filter(created_at__date=day).exists()
        if has_submission:
            streak += 1
        else:
            break

    recent_submissions = user_submissions.order_by("-created_at")[:5]

    recent_activity = []
    for submission in recent_submissions:
        like_count = SubmissionReaction.objects.filter(
            submission=submission,
            reaction="like",
        ).count()

        recent_activity.append({
            "id": submission.id,
            "type": "submission",
            "title": f'Completed "{submission.challenge.title}"',
            "time": submission.created_at.isoformat() if submission.created_at else None,
            "likes": like_count,
            "challenge": submission.challenge.title,
        })

    return Response({
        "user": {
            "id": user.id,
            "username": user.username,
            "display_name": user.get_full_name() or user.username,
            "email": user.email,
        },
        "stats": {
            "total_submissions": total_submissions,
            "total_likes": total_likes,
            "streak": streak,
        },
        "weekly_activity": weekly_activity,
        "recent_activity": recent_activity,
    })