from django.db import models
from django.contrib.auth.models import User


class Challenge(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    difficulty = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Submission(models.Model):
    challenge = models.ForeignKey(
        "Challenge",
        on_delete=models.CASCADE,
        related_name="submissions",
    )
    github_link = models.URLField()
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="submissions",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission for {self.challenge.title} at {self.created_at}"


class SubmissionReaction(models.Model):
    REACTION_CHOICES = [
        ('like', 'Like'),
        ('love', 'Love'),
    ]

    submission = models.ForeignKey(
        Submission,
        on_delete=models.CASCADE,
        related_name='reactions'
    )
    user_name = models.CharField(max_length=100)
    reaction = models.CharField(max_length=10, choices=REACTION_CHOICES)

    class Meta:
        unique_together = ('submission', 'user_name')

    def __str__(self):
        return f"{self.user_name} -> {self.reaction}"
    

class ChatMessage(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="chat_messages",
        null=True,
        blank=True,
    )
    content = models.TextField()
    msg_id = models.CharField(max_length=100, blank=True, default="")
    edited = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

        
class Post(models.Model):
    POST_TYPES = [
        ("general", "General"),
        ("help", "Help & Questions"),
        ("win", "Wins & Celebrations"),
        ("code-review", "Code Review"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="posts",
    )
    content = models.TextField()
    post_type = models.CharField(
        max_length=20,
        choices=POST_TYPES,
        default="general",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}"


class PostLike(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="likes",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="post_likes",
    )

    class Meta:
        unique_together = ("post", "user")

    def __str__(self):
        return f"{self.user.username} liked post {self.post.id}"


class PostComment(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="post_comments",
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


    

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}"
    
class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    bio = models.TextField(blank=True, default="")
    location = models.CharField(max_length=100, blank=True, default="")
    github = models.URLField(blank=True, default="")
    linkedin = models.URLField(blank=True, default="")
    website = models.URLField(blank=True, default="")
    skills = models.JSONField(default=list, blank=True)


    def __str__(self):
        return f"{self.user.username}'s profile"