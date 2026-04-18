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