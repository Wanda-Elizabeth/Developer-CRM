import requests
from datetime import timedelta, datetime
from urllib.parse import urlparse

from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response


from .models import Challenge, Submission, SubmissionReaction, Post, PostLike, PostComment
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
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile_data(request):
    user = request.user
    
    user_submissions = Submission.objects.filter(user=user).select_related("challenge")
    total_submissions = user_submissions.count()
    
    total_likes = SubmissionReaction.objects.filter(
        submission__in=user_submissions,
        reaction="like",
    ).count()

    # Compute current streak
    today = timezone.now().date()
    streak = 0
    for i in range(0, 365):
        day = today - timedelta(days=i)
        if user_submissions.filter(created_at__date=day).exists():
            streak += 1
        else:
            break

    # Compute longest streak
    dates = sorted(set(
        user_submissions.values_list("created_at__date", flat=True)
    ))
    longest = 0
    current = 0
    prev = None
    for d in dates:
        if prev and (d - prev).days == 1:
            current += 1
        else:
            current = 1
        longest = max(longest, current)
        prev = d

    # Global rank: count users with more points
    all_users = User.objects.all()
    my_points = total_submissions * 50 + total_likes * 12
    rank = 1
    for u in all_users:
        if u == user:
            continue
        u_subs = Submission.objects.filter(user=u).count()
        u_likes = SubmissionReaction.objects.filter(
            submission__user=u, reaction="like"
        ).count()
        if (u_subs * 50 + u_likes * 12) > my_points:
            rank += 1

    return Response({
        "username": user.get_full_name() or user.username,
        "email": user.email,
        "joined_at": user.date_joined.isoformat(),
        "total_submissions": total_submissions,
        "total_likes": total_likes,
        "streak": streak,
        "longest_streak": longest,
        "global_rank": f"#{rank}",
        "total_points": my_points,
    })


@api_view(["GET"])
def leaderboard_data(request):
    """Returns real leaderboard computed from DB."""
    users = User.objects.all()
    entries = []

    for u in users:
        subs = Submission.objects.filter(user=u)
        sub_count = subs.count()
        if sub_count == 0:
            continue
        likes = SubmissionReaction.objects.filter(
            submission__in=subs, reaction="like"
        ).count()
        points = sub_count * 50 + likes * 12

        # streak
        today = timezone.now().date()
        streak = 0
        for i in range(365):
            day = today - timedelta(days=i)
            if subs.filter(created_at__date=day).exists():
                streak += 1
            else:
                break

        entries.append({
            "username": u.username,
            "full_name": u.get_full_name() or u.username,
            "points": points,
            "submissions": sub_count,
            "streak": streak,
        })

    entries.sort(key=lambda x: x["points"], reverse=True)
    for i, entry in enumerate(entries):
        entry["rank"] = i + 1

    return Response(entries)


@api_view(["GET"])
def trending_skills(request):
    SKILL_KEYWORDS = [
        "React", "TypeScript", "Django", "Python", "Node",
        "Vue", "GraphQL", "REST", "SQL", "CSS", "JavaScript",
    ]
    challenges = Challenge.objects.all()
    counts = {skill: 0 for skill in SKILL_KEYWORDS}

    for challenge in challenges:
        text = f"{challenge.title} {challenge.description}".lower()
        for skill in SKILL_KEYWORDS:
            if skill.lower() in text:
                counts[skill] += 1 

    result = [
        {"name": skill, "count": count}
        for skill, count in counts.items()
        if count > 0
    ]
    result.sort(key=lambda x: x["count"], reverse=True)
    return Response(result[:5])

import requests
from datetime import datetime

@api_view(["GET"])
def job_listings(request):
    jobs = []
    cutoff = timezone.now().replace(tzinfo=None) - timedelta(days=7)

    # --- Remotive ---
    try:
        res = requests.get(
            "https://remotive.com/api/remote-jobs?category=software-dev&limit=20",
            timeout=5
        )
        if res.ok:
            for job in res.json().get("jobs", []):
                try:
                    pub_date = datetime.fromisoformat(
                        job["publication_date"].rstrip("Z")
                    )
                    if pub_date >= cutoff:
                        jobs.append({
                            "id": f"remotive-{job['id']}",
                            "title": job.get("title"),
                            "company": job.get("company_name"),
                            "location": job.get("candidate_required_location", "Remote"),
                            "url": job.get("url"),
                            "tags": job.get("tags", []),
                            "date": job.get("publication_date"),
                            "source": "remotive",
                        })
                except Exception:
                    continue
    except Exception as e:
        print(f"Remotive error: {e}")

    # --- RemoteOK ---
    try:
        res = requests.get(
            "https://remoteok.io/api?tag=dev",
            timeout=5,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        if res.ok:
            data = res.json()
            # remoteok first item is metadata, skip it
            for job in data[1:]:
                try:
                    pub_date = datetime.utcfromtimestamp(int(job.get("epoch", 0)))
                    if pub_date >= cutoff:
                        jobs.append({
                            "id": f"remoteok-{job.get('id')}",
                            "title": job.get("position"),
                            "company": job.get("company"),
                            "location": "Remote",
                            "url": job.get("url"),
                            "tags": job.get("tags", []),
                            "date": job.get("date"),
                            "source": "remoteok",
                        })
                except Exception:
                    continue
    except Exception as e:
        print(f"RemoteOK error: {e}")

    # sort by date, newest first
    jobs.sort(key=lambda x: x.get("date") or "", reverse=True)

    return Response(jobs)


from .models import Challenge, Submission, SubmissionReaction, Post, PostLike, PostComment


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def community_posts(request):
    if request.method == "GET":
        post_type = request.query_params.get("type", None)
        posts = Post.objects.select_related("user").prefetch_related(
            "likes", "comments"
        )
        if post_type and post_type != "all":
            posts = posts.filter(post_type=post_type)

        data = []
        for post in posts:
            data.append({
                "id": post.id,
                "username": post.user.username,
                "display_name": post.user.get_full_name() or post.user.username,
                "content": post.content,
                "post_type": post.post_type,
                "created_at": post.created_at.isoformat(),
                "likes_count": post.likes.count(),
                "comments_count": post.comments.count(),
                "liked_by_me": post.likes.filter(user=request.user).exists(),
            })
        return Response(data)

    if request.method == "POST":
        content = request.data.get("content", "").strip()
        post_type = request.data.get("post_type", "general")

        if not content:
            return Response({"error": "Content is required"}, status=400)

        post = Post.objects.create(
            user=request.user,
            content=content,
            post_type=post_type,
        )
        return Response({
            "id": post.id,
            "username": post.user.username,
            "display_name": post.user.get_full_name() or post.user.username,
            "content": post.content,
            "post_type": post.post_type,
            "created_at": post.created_at.isoformat(),
            "likes_count": 0,
            "comments_count": 0,
            "liked_by_me": False,
        }, status=201)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=404)

    like, created = PostLike.objects.get_or_create(
        post=post,
        user=request.user,
    )
    if not created:
        like.delete()
        liked = False
    else:
        liked = True

    return Response({
        "liked": liked,
        "likes_count": post.likes.count(),
    })


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def post_comments(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=404)

    if request.method == "GET":
        comments = post.comments.select_related("user")
        return Response([
            {
                "id": c.id,
                "username": c.user.username,
                "display_name": c.user.get_full_name() or c.user.username,
                "content": c.content,
                "created_at": c.created_at.isoformat(),
            }
            for c in comments
        ])

    if request.method == "POST":
        content = request.data.get("content", "").strip()
        if not content:
            return Response({"error": "Content is required"}, status=400)

        comment = PostComment.objects.create(
            post=post,
            user=request.user,
            content=content,
        )
        return Response({
            "id": comment.id,
            "username": comment.user.username,
            "display_name": comment.user.get_full_name() or comment.user.username,
            "content": comment.content,
            "created_at": comment.created_at.isoformat(),
        }, status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def online_users(request):
    cutoff = timezone.now() - timedelta(minutes=15)

    recent_users = User.objects.filter(
        last_login__gte=cutoff
    ).exclude(id=request.user.id)[:10]

    total_online = User.objects.filter(
        last_login__gte=cutoff
    ).count()

    return Response({
        "total": total_online,
        "users": [
            {
                "username": u.username,
                "display_name": u.get_full_name() or u.username,
            }
            for u in recent_users
        ]
    })
    # Users active in the last 15 minutes
    from datetime import timedelta
    cutoff = timezone.now() - timedelta(minutes=15)
    
    recent_users = User.objects.filter(
        last_login__gte=cutoff
    ).exclude(id=request.user.id)[:10]
    
    total_online = User.objects.filter(
        last_login__gte=cutoff
    ).count()

    return Response({
        "total": total_online,
        "users": [
            {
                "username": u.username,
                "display_name": u.get_full_name() or u.username,
            }
            for u in recent_users
        ]
    })