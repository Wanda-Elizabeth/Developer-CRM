import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User

from .models import ChatMessage, ChatReaction

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_group_name = "global_chat"
        try:
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
        except Exception as e:
            logger.exception("WebSocket connect failed: %s", e)
            try:
                await self.accept()
                await self.send(text_data=json.dumps({
                    "type": "history",
                    "messages": [],
                }))
            except Exception:
                pass

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name,
            )
        except Exception as e:
            logger.exception("WebSocket disconnect failed: %s", e)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        msg_type = data.get("type", "message")
        username = data.get("username", "Anonymous")

        if msg_type == "message":
            message = data.get("message", "").strip()
            msg_id = data.get("id", "")
            if not message:
                return
            saved = await self.save_message(username, message, msg_id)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "id": saved.get("id") or msg_id,
                    "message": message,
                    "username": saved.get("username") or username,
                    "time": saved.get("time"),
                },
            )

        elif msg_type == "edit":
            msg_id = data.get("id", "")
            message = data.get("message", "").strip()
            if not msg_id or not message:
                return
            updated = await self.update_message(msg_id, message, username)
            if not updated:
                return
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_edit",
                    "id": msg_id,
                    "message": message,
                    "username": username,
                },
            )

        # ✅ Fixed indentation — reaction is now a proper elif block
        elif msg_type == "reaction":
            msg_id = data.get("id", "")
            emoji = data.get("emoji", "")
            if not msg_id or not emoji:
                return
            result = await self.toggle_reaction(msg_id, emoji, username)
            if result is not None:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_reaction",
                        "id": msg_id,
                        "emoji": emoji,
                        "users": result["users"],
                    },
                )

        elif msg_type == "delete":
            msg_id = data.get("id", "")
            if not msg_id:
                return
            deleted = await self.delete_message(msg_id, username)
            if not deleted:
                return
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
            "time": event.get("time"),
        }))

    async def chat_edit(self, event):
        await self.send(text_data=json.dumps({
            "type": "edit",
            "id": event["id"],
            "message": event["message"],
            "username": event.get("username"),
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

    async def chat_reaction(self, event):
        await self.send(text_data=json.dumps({
            "type": "reaction",
            "id": event["id"],
            "emoji": event["emoji"],
            "users": event["users"],
        }))

    @database_sync_to_async
    def get_recent_messages(self):
        messages = (
            ChatMessage.objects
            .select_related("user")
            .prefetch_related("reactions__user")
            .order_by("-created_at")[:50]
        )
        result = []
        for m in reversed(list(messages)):
            reactions = {}
            for r in m.reactions.all():
                if r.emoji not in reactions:
                    reactions[r.emoji] = []
                reactions[r.emoji].append(r.user.username)
            result.append({
                "id": m.msg_id if m.msg_id else f"hist-{m.id}",
                "message": m.content,
                "username": m.user.username if m.user else "Anonymous",
                "time": m.created_at.isoformat(),
                "edited": m.edited,
                "reactions": reactions,
            })
        return result

    @database_sync_to_async
    def save_message(self, username, message, msg_id=""):
        try:
            user = User.objects.filter(username=username).first()
            chat_message = ChatMessage.objects.create(
                user=user,
                content=message,
                msg_id=msg_id,
            )
            return {
                "id": chat_message.msg_id or f"hist-{chat_message.id}",
                "username": user.username if user else username or "Anonymous",
                "time": chat_message.created_at.isoformat(),
            }
        except Exception as e:
            logger.exception("Failed to save chat message: %s", e)
            return {
                "id": msg_id,
                "username": username or "Anonymous",
                "time": None,
            }

    @database_sync_to_async
    def update_message(self, msg_id, message, username):
        try:
            updated = ChatMessage.objects.filter(
                msg_id=msg_id,
                user__username=username,
            ).update(content=message, edited=True)
            return updated > 0
        except Exception as e:
            logger.exception("Failed to update chat message: %s", e)
            return False

    @database_sync_to_async
    def delete_message(self, msg_id, username):
        try:
            deleted_count, _ = ChatMessage.objects.filter(
                msg_id=msg_id,
                user__username=username,
            ).delete()
            return deleted_count > 0
        except Exception as e:
            logger.exception("Failed to delete chat message: %s", e)
            return False

    @database_sync_to_async
    def toggle_reaction(self, msg_id, emoji, username):
        try:
            user = User.objects.get(username=username)
            msg = ChatMessage.objects.get(msg_id=msg_id)
            reaction, created = ChatReaction.objects.get_or_create(
                message=msg, user=user, emoji=emoji
            )
            if not created:
                reaction.delete()
            users = list(
                ChatReaction.objects.filter(message=msg, emoji=emoji)
                .values_list("user__username", flat=True)
            )
            return {"users": users}
        except Exception as e:
            logger.exception("Failed to toggle reaction: %s", e)
            return None