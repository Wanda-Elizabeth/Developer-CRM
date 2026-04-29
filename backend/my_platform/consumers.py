import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "global_chat"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

        # Send last 30 messages on connect
        messages = await self.get_recent_messages()
        await self.send(text_data=json.dumps({
            "type": "history",
            "messages": messages,
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get("message", "").strip()
        username = data.get("username", "Anonymous")

        if not message:
            return

        # Save to DB
        await self.save_message(username, message)

        # Broadcast to group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "username": username,
            },
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "message",
            "message": event["message"],
            "username": event["username"],
        }))

    @database_sync_to_async
    def get_recent_messages(self):
        messages = ChatMessage.objects.select_related("user").order_by("-created_at")[:30]
        return [
            {
                "message": m.content,
                "username": m.user.username if m.user else "Anonymous",
                "time": m.created_at.isoformat(),
            }
            for m in reversed(list(messages))
        ]

    @database_sync_to_async
    def save_message(self, username, message):
        try:
            user = User.objects.get(username=username)
            ChatMessage.objects.create(user=user, content=message)
        except User.DoesNotExist:
            pass