import { useEffect, useRef, useState } from "react";
import {
  Send,
  Hash,
  Users,
  Wifi,
  WifiOff,
  Pencil,
  Trash2,
  Check,
  X,
  CheckCheck,
  ChevronDown,
} from "lucide-react";

type Message = {
  id: string;
  message: string;
  username: string;
  time?: string;
  edited?: boolean;
};

type Props = {
  currentUsername: string;
  wsBase?: string;
  onUnreadChange?: (count: number) => void;
};

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-pink-500 to-rose-600",
  "from-yellow-500 to-orange-600",
];

const EMOJIS = ["❤️", "😂", "👍", "🔥", "🎉", "💯"];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name?.slice(0, 2).toUpperCase() || "??";
}

function formatTime(isoString?: string) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(isoString?: string) {
  if (!isoString) return "Today";
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function ChatPage({ currentUsername, wsBase, onUnreadChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [reactions, setReactions] = useState<Record<string, Record<string, string[]>>>({});
  const [showReactionFor, setShowReactionFor] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState(1);

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentIdsRef = useRef<Set<string>>(new Set());
  const connectedRef = useRef(false);

  useEffect(() => {
    if (connectedRef.current) return;
    connectedRef.current = true;

    const base =
      wsBase ||
      (window.location.protocol === "https:" ? "wss" : "ws") +
        "://" +
        window.location.hostname +
        ":8011";
    const wsUrl = `${base}/ws/chat/`;

    const connect = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        setTimeout(connect, 3000);
      };
      ws.onerror = () => setConnected(false);

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.type === "history") {
          setMessages(
            (data.messages || []).map((m: Message, i: number) => ({
              ...m,
              id: m.id || `hist-${i}`,
            }))
          );
        } else if (data.type === "message") {
          const msgId = data.id || `msg-${Date.now()}`;
          if (sentIdsRef.current.has(msgId)) {
            sentIdsRef.current.delete(msgId);
            return;
          }
          setMessages((prev) => {
            if (prev.find((m) => m.id === msgId)) return prev;
            return [
              ...prev,
              {
                id: msgId,
                message: data.message,
                username: data.username,
                time: new Date().toISOString(),
              },
            ];
          });
          setIsAtBottom((atBottom) => {
            if (!atBottom || document.hidden) {
              setUnreadCount((c) => {
                const next = c + 1;
                onUnreadChange?.(next);
                return next;
              });
            }
            return atBottom;
          });
          if (document.hidden && Notification.permission === "granted") {
            new Notification(`${data.username} in #general`, {
              body: data.message,
              icon: "/favicon.ico",
            });
          }
        } else if (data.type === "edit") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === data.id
                ? { ...m, message: data.message, edited: true }
                : m
            )
          );
        } else if (data.type === "delete") {
          setMessages((prev) => prev.filter((m) => m.id !== data.id));
        } else if (data.type === "typing") {
          if (data.username === currentUsername) return;
          setTypingUsers((prev) =>
            prev.includes(data.username) ? prev : [...prev, data.username]
          );
          setTimeout(() => {
            setTypingUsers((prev) =>
              prev.filter((u) => u !== data.username)
            );
          }, 3000);
        } else if (data.type === "online_count") {
          setOnlineCount(data.count);
        }
      };
    };

    connect();

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      connectedRef.current = false;
      wsRef.current?.close();
    };
  }, [wsBase, currentUsername]);

  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
      onUnreadChange?.(0);
    }
  }, [messages, isAtBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setIsAtBottom(atBottom);
    setShowScrollDown(!atBottom);
    if (atBottom) {
      setUnreadCount(0);
      onUnreadChange?.(0);
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0);
    onUnreadChange?.(0);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
      return;
    const id = `msg-${Date.now()}-${Math.random()}`;
    const optimisticMsg: Message = {
      id,
      message: text,
      username: currentUsername,
      time: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    sentIdsRef.current.add(id);
    wsRef.current.send(
      JSON.stringify({ type: "message", id, message: text, username: currentUsername })
    );
    setInput("");
    inputRef.current?.focus();
  };

  const sendEdit = (id: string) => {
    if (!editText.trim() || !wsRef.current) return;
    wsRef.current.send(
      JSON.stringify({ type: "edit", id, message: editText.trim(), username: currentUsername })
    );
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, message: editText.trim(), edited: true } : m
      )
    );
    setEditingId(null);
    setEditText("");
  };

  const sendDelete = (id: string) => {
    if (!wsRef.current) return;
    wsRef.current.send(
      JSON.stringify({ type: "delete", id, username: currentUsername })
    );
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: "typing", username: currentUsername })
      );
    }
    typingTimeoutRef.current = setTimeout(() => {}, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleReaction = (msgId: string, emoji: string) => {
    setReactions((prev) => {
      const msgR = { ...(prev[msgId] || {}) };
      const users = msgR[emoji] || [];
      msgR[emoji] = users.includes(currentUsername)
        ? users.filter((u) => u !== currentUsername)
        : [...users, currentUsername];
      return { ...prev, [msgId]: msgR };
    });
    setShowReactionFor(null);
  };

  const grouped = messages.reduce<{ date: string; messages: Message[] }[]>(
    (acc, msg) => {
      const date = formatDate(msg.time);
      const last = acc[acc.length - 1];
      if (last && last.date === date) {
        last.messages.push(msg);
      } else {
        acc.push({ date, messages: [msg] });
      }
      return acc;
    },
    []
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0 pb-3 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
            <Hash className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white tracking-tight">general</h1>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            </div>
            <p className="text-white/35 text-xs">DevBuild community · real-time chat</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <Users className="w-3.5 h-3.5" />
            <span>{onlineCount} online</span>
          </div>
          {connected ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <Wifi className="w-3 h-3" />
              Connected
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
              <WifiOff className="w-3 h-3" />
              Reconnecting...
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-auto rounded-2xl border border-white/8 bg-black/20 p-4"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                <Hash className="w-8 h-8 text-violet-400" />
              </div>
              <p className="text-white/60 font-bold text-lg">Welcome to #general</p>
              <p className="text-white/30 text-sm mt-1 max-w-xs leading-relaxed">
                This is the beginning of the DevBuild community chat. Say hi! 👋
              </p>
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.date}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-white/6" />
                <span className="text-xs text-white/25 font-medium bg-white/5 border border-white/8 px-3 py-1 rounded-full">
                  {group.date}
                </span>
                <div className="flex-1 h-px bg-white/6" />
              </div>

              {group.messages.map((msg, i) => {
                const isMe = msg.username === currentUsername;
                const prevMsg = group.messages[i - 1];
                const showAvatar = !prevMsg || prevMsg.username !== msg.username;
                const msgReactions = reactions[msg.id] || {};
                const hasReactions = Object.values(msgReactions).some((u) => u.length > 0);

                return (
                  <div
                    key={msg.id}
                    className={`group flex gap-2.5 ${isMe ? "flex-row-reverse" : ""} ${
                      !showAvatar ? (isMe ? "pr-[44px]" : "pl-[44px]") : ""
                    } mb-1`}
                  >
                    {showAvatar ? (
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-xs font-black text-white self-end mb-0.5 ${getAvatarColor(msg.username)}`}>
                        {getInitials(msg.username)}
                      </div>
                    ) : (
                      <div className="w-8 flex-shrink-0" />
                    )}

                    <div className={`max-w-[65%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      {showAvatar && (
                        <div className={`flex items-center gap-2 mb-1 ${isMe ? "flex-row-reverse" : ""}`}>
                          <span className={`text-xs font-bold ${isMe ? "text-violet-400" : "text-white/60"}`}>
                            {isMe ? "You" : msg.username}
                          </span>
                          <span className="text-[10px] text-white/20">{formatTime(msg.time)}</span>
                        </div>
                      )}

                      <div className="relative">
                        {editingId === msg.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") sendEdit(msg.id);
                                if (e.key === "Escape") { setEditingId(null); setEditText(""); }
                              }}
                              className="rounded-xl border border-violet-500/50 bg-white/10 px-3 py-2 text-sm text-white outline-none min-w-[200px]"
                              autoFocus
                            />
                            <button onClick={() => sendEdit(msg.id)} className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition-all">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => { setEditingId(null); setEditText(""); }} className="w-7 h-7 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/15 transition-all">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                            isMe
                              ? "bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-tr-sm shadow-lg shadow-violet-500/15"
                              : "bg-white/8 border border-white/8 text-white/85 rounded-tl-sm"
                          }`}>
                            {msg.message}
                            {msg.edited && (
                              <span className="text-[10px] opacity-50 ml-1.5">edited</span>
                            )}
                          </div>
                        )}

                        {/* Hover actions */}
                        {editingId !== msg.id && (
                          <div className={`absolute top-1/2 -translate-y-1/2 ${
                            isMe ? "right-full mr-2" : "left-full ml-2"
                          } flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150 z-10`}>
                            <button
                              onClick={() => setShowReactionFor(showReactionFor === msg.id ? null : msg.id)}
                              className="w-7 h-7 rounded-lg bg-[#1a1a24] border border-white/10 flex items-center justify-center text-sm hover:bg-white/10 transition-all shadow-lg"
                            >
                              😊
                            </button>
                            {isMe && (
                              <>
                                <button
                                  onClick={() => { setEditingId(msg.id); setEditText(msg.message); }}
                                  className="w-7 h-7 rounded-lg bg-[#1a1a24] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all shadow-lg"
                                >
                                  <Pencil className="w-3 h-3 text-white/50" />
                                </button>
                                <button
                                  onClick={() => sendDelete(msg.id)}
                                  className="w-7 h-7 rounded-lg bg-[#1a1a24] border border-white/10 flex items-center justify-center hover:bg-red-500/20 transition-all shadow-lg"
                                >
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                </button>
                              </>
                            )}
                          </div>
                        )}

                        {/* Emoji picker */}
                        {showReactionFor === msg.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setShowReactionFor(null)} />
                            <div className={`absolute top-full mt-2 ${isMe ? "right-0" : "left-0"} z-40 flex gap-1 bg-[#1a1a24] border border-white/15 rounded-2xl p-2 shadow-2xl`}>
                              {EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => toggleReaction(msg.id, emoji)}
                                  className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-lg transition-all hover:scale-110"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Reactions */}
                      {hasReactions && (
                        <div className={`flex flex-wrap gap-1 mt-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
                          {Object.entries(msgReactions).map(([emoji, users]) =>
                            users.length > 0 ? (
                              <button
                                key={emoji}
                                onClick={() => toggleReaction(msg.id, emoji)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
                                  users.includes(currentUsername)
                                    ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                                }`}
                              >
                                {emoji} <span className="font-semibold">{users.length}</span>
                              </button>
                            ) : null
                          )}
                        </div>
                      )}

                      {/* Double tick */}
                      {isMe && (
                        <div className="flex justify-end mt-0.5">
                          <CheckCheck className="w-3 h-3 text-blue-400/60" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 pl-1 pt-1">
                  <div className="flex gap-0.5 bg-white/6 border border-white/8 rounded-2xl rounded-tl-sm px-3 py-2">
                    {[0, 150, 300].map((delay) => (
                      <div
                        key={delay}
                        className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce mx-0.5"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-white/30">
                    {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing
                  </span>
                </div>
              )}
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* WhatsApp scroll button */}
        {showScrollDown && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-3 right-3 z-10 flex items-center justify-center rounded-full bg-[#1e1e2e] border border-white/15 shadow-xl hover:bg-[#2a2a3e] transition-all"
            style={{ width: 38, height: 38 }}
          >
            <ChevronDown className="w-4 h-4 text-white/70" />
            {unreadCount > 0 && (
              <div className="absolute -top-1.5 -right-1 min-w-[18px] h-[18px] bg-violet-500 rounded-full flex items-center justify-center px-1 shadow-lg">
                <span className="text-[9px] font-black text-white leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 mt-3">
        {!connected && (
          <p className="text-xs text-red-400 text-center mb-2 bg-red-500/10 border border-red-500/20 rounded-xl py-2">
            Disconnected — reconnecting automatically...
          </p>
        )}
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={connected ? "Message #general..." : "Connecting..."}
            disabled={!connected}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-violet-500/40 disabled:opacity-40 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !input.trim()}
            className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center text-white hover:opacity-90 disabled:opacity-30 transition-all shadow-lg shadow-violet-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}