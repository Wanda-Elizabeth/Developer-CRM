import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import ChatMessage


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_group_name = "global_chat"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()
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
        msg_type = data.get("type", "message")
        username = data.get("username", "Anonymous")

        if msg_type == "message":
            message = data.get("message", "").strip()
            msg_id = data.get("id", "")
            if not message:
                return
            await self.save_message(username, message, msg_id)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "id": msg_id,
                    "message": message,
                    "username": username,
                },
            )

        elif msg_type == "edit":
            msg_id = data.get("id", "")
            message = data.get("message", "").strip()
            if not message:
                return
            await self.update_message(msg_id, message, username)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_edit",
                    "id": msg_id,
                    "message": message,
                    "username": username,
                },
            )

        elif msg_type == "delete":
            msg_id = data.get("id", "")
            await self.delete_message(msg_id, username)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_delete",
                    "id": msg_id,
                },
            )

        elif msg_type == "typing":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_typing",
                    "username": username,
                },
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "message",
            "id": event.get("id"),
            "message": event["message"],
            "username": event["username"],
        }))

    async def chat_edit(self, event):
        await self.send(text_data=json.dumps({
            "type": "edit",
            "id": event["id"],
            "message": event["message"],
        }))

    async def chat_delete(self, event):
        await self.send(text_data=json.dumps({
            "type": "delete",
            "id": event["id"],
        }))

    async def chat_typing(self, event):
        await self.send(text_data=json.dumps({
            "type": "typing",
            "username": event["username"],
        }))

    @database_sync_to_async
    def get_recent_messages(self):
        messages = ChatMessage.objects.select_related("user").order_by("-created_at")[:30]
        return [
            {
                "id": m.msg_id or f"hist-{m.id}",
                "message": m.content,
                "username": m.user.username if m.user else "Anonymous",
                "time": m.created_at.isoformat(),
                "edited": m.edited,
            }
            for m in reversed(list(messages))
        ]

    @database_sync_to_async
    def save_message(self, username, message, msg_id=""):
        try:
            user = User.objects.get(username=username)
            ChatMessage.objects.create(
                user=user,
                content=message,
                msg_id=msg_id,
            )
        except User.DoesNotExist:
            pass

    @database_sync_to_async
    def update_message(self, msg_id, message, username):
        try:
            ChatMessage.objects.filter(
                msg_id=msg_id,
                user__username=username,
            ).update(content=message, edited=True)
        except Exception:
            pass

    @database_sync_to_async
    def delete_message(self, msg_id, username):
        try:
            ChatMessage.objects.filter(
                msg_id=msg_id,
                user__username=username,
            ).delete()
        except Exception:
            pass