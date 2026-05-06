import { useEffect, useRef, useState } from "react";
import { Send, Hash, Users, Wifi, WifiOff } from "lucide-react";

type Message = {
  message: string;
  username: string;
  time?: string;
};

type Props = {
  currentUsername: string;
  wsBase?: string;
};

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-pink-500 to-rose-600",
  "from-yellow-500 to-orange-600",
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name?.slice(0, 2).toUpperCase() || "??";
}

function formatTime(isoString?: string) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatPage({ currentUsername, wsBase }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Build WebSocket URL
    const base = wsBase
      || (window.location.protocol === "https:" ? "wss" : "ws") +
         "://" + window.location.host;
    const wsUrl = `${base}/ws/chat/`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = () => {
      setConnected(false);
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "history") {
        setMessages(data.messages || []);
      } else if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          {
            message: data.message,
            username: data.username,
            time: new Date().toISOString(),
          },
        ]);
      } else if (data.type === "online_count") {
        setOnlineCount(data.count);
      }
    };

    return () => {
      ws.close();
    };
  }, [wsBase]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(
      JSON.stringify({
        message: text,
        username: currentUsername,
      })
    );
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const grouped = messages.reduce<{ date: string; messages: Message[] }[]>((acc, msg) => {
    const date = msg.time
      ? new Date(msg.time).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })
      : "Today";
    const last = acc[acc.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      acc.push({ date, messages: [msg] });
    }
    return acc;
  }, []);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Hash className="w-5 h-5 text-violet-400" />
            <h1 className="text-2xl font-bold text-white">General Chat</h1>
            <div className={`w-2 h-2 rounded-full ml-1 ${connected ? "bg-emerald-400" : "bg-red-400"}`} />
          </div>
          <p className="text-white/50 text-sm">
            Global developer chat — ask questions, share wins, connect
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {connected ? (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Wifi className="w-4 h-4" />
              <span>Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-red-400">
              <WifiOff className="w-4 h-4" />
              <span>Disconnected</span>
            </div>
          )}
          {onlineCount > 0 && (
            <div className="flex items-center gap-1.5 text-white/40 ml-3">
              <Users className="w-4 h-4" />
              <span>{onlineCount} online</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-white/3 p-4 space-y-1 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-white/40 font-semibold">No messages yet</p>
            <p className="text-white/25 text-sm mt-1">
              Be the first to say something!
            </p>
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs text-white/25 font-medium px-2">{group.date}</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Messages in group */}
            {group.messages.map((msg, i) => {
              const isMe = msg.username === currentUsername;
              const showAvatar = i === 0 || group.messages[i - 1]?.username !== msg.username;

              return (
                <div
                  key={i}
                  className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""} ${!showAvatar ? "pl-11" : ""} mb-1`}
                >
                  {/* Avatar — only show when username changes */}
                  {showAvatar && (
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${getAvatarColor(msg.username)}`}
                    >
                      {getInitials(msg.username)}
                    </div>
                  )}

                  <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                    {/* Username + time — only show when avatar shows */}
                    {showAvatar && (
                      <div className={`flex items-center gap-2 mb-1 ${isMe ? "flex-row-reverse" : ""}`}>
                        <span className={`text-xs font-semibold ${isMe ? "text-violet-400" : "text-white/60"}`}>
                          {isMe ? "You" : msg.username}
                        </span>
                        {msg.time && (
                          <span className="text-xs text-white/25">{formatTime(msg.time)}</span>
                        )}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                        isMe
                          ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-tr-sm"
                          : "bg-white/8 border border-white/8 text-white/85 rounded-tl-sm"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 mt-3">
        {!connected && (
          <p className="text-xs text-red-400 mb-2 text-center">
            Disconnected — trying to reconnect...
          </p>
        )}
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={connected ? "Message #general..." : "Connecting..."}
              disabled={!connected}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-violet-500/50 disabled:opacity-40 transition-all"
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!connected || !input.trim()}
            className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center text-white hover:opacity-90 disabled:opacity-30 transition-all hover:-translate-y-0.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-white/20 mt-2 text-center">
          Press Enter to send · Be respectful · No spam
        </p>
      </div>
    </div>
  );
}