import os
import json
from django.core.management.base import BaseCommand
from my_platform.models import Challenge
from groq import Groq


class Command(BaseCommand):
    help = "Generate weekly challenges using Groq AI"

    def handle(self, *args, **kwargs):
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

        existing = list(Challenge.objects.values_list("title", flat=True))

        prompt = f"""Generate 2 unique coding challenges for a developer community platform.

Avoid these existing challenges: {existing}

Return ONLY a valid JSON array with exactly 2 objects, no markdown, no extra text:
[
  {{
    "title": "Challenge title",
    "description": "Clear description of what to build, 2-3 sentences",
    "difficulty": "Easy"
  }},
  {{
    "title": "Challenge title",
    "description": "Clear description of what to build, 2-3 sentences",
    "difficulty": "Medium"
  }}
]

Use modern tech: React, Django, TypeScript, Node, Python, GraphQL, REST APIs, CSS."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500,
        )

        response_text = response.choices[0].message.content.strip()
        response_text = response_text.replace("```json", "").replace("```", "").strip()

        challenges = json.loads(response_text)

        for c in challenges:
            Challenge.objects.create(
                title=c["title"],
                description=c["description"],
                difficulty=c["difficulty"],
            )
            self.stdout.write(
                self.style.SUCCESS(f"✅ Created: {c['title']}")
            )

        self.stdout.write(self.style.SUCCESS("Done!"))