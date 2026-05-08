import { useState, useRef, useEffect } from "react";
import { Bell, Search, Menu, X, Code2, Heart, Trophy, Briefcase } from "lucide-react";

export type Notification = {
  id: string;
  type: "like" | "challenge" | "submission" | "job";
  message: string;
  time: string;
  read: boolean;
};

type Props = {
  username: string;
  onLogout: () => void;
  onMenuOpen: () => void;
  notifications?: Notification[];
  onMarkAllRead?: () => void;
  onSearch?: (query: string) => void;
};

function timeAgo(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const NOTIF_ICON: Record<string, React.ReactNode> = {
  like: <Heart className="w-4 h-4 text-red-400" />,
  challenge: <Code2 className="w-4 h-4 text-violet-400" />,
  submission: <Trophy className="w-4 h-4 text-yellow-400" />,
  job: <Briefcase className="w-4 h-4 text-blue-400" />,
};

export function TopNavbar({
  username,
  onLogout,
  onMenuOpen,
  notifications = [],
  onMarkAllRead,
  onSearch,
}: Props) {
  const initials = username
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notifsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  // Close notifs when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) onSearch?.(searchQuery.trim());
  };

  const BellButton = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="relative" ref={notifsRef}>
      <button
        onClick={() => setShowNotifs((v) => !v)}
        className={`relative rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/70 hover:bg-white/10 hover:text-white transition-all ${mobile ? "" : ""}`}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
            <span className="text-[9px] font-black text-white">{unread > 9 ? "9+" : unread}</span>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {showNotifs && (
        <div className={`absolute ${mobile ? "right-0" : "right-0"} top-full mt-2 w-80 bg-[#0f0f18] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Notifications</span>
              {unread > 0 && (
                <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-semibold">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={() => { onMarkAllRead?.(); setShowNotifs(false); }}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/40">No notifications yet</p>
                <p className="text-xs text-white/25 mt-1">
                  Activity will show up here
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-all ${
                    !n.read ? "bg-violet-500/5" : ""
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    !n.read ? "bg-violet-500/15" : "bg-white/5"
                  }`}>
                    {NOTIF_ICON[n.type] || <Bell className="w-4 h-4 text-white/40" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${!n.read ? "text-white/80" : "text-white/50"}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-white/30 mt-1">{timeAgo(n.time)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header className="border-b border-white/10 bg-black/30 px-4 sm:px-6 py-3 backdrop-blur-xl relative z-40">

      {/* MOBILE */}
      <div className="flex items-center justify-between lg:hidden">
        <button
          onClick={onMenuOpen}
          className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <Menu className="h-5 w-5" />
        </button>

        {showSearch ? (
          <form onSubmit={handleSearch} className="flex-1 mx-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-xl border border-violet-500/40 bg-black/40 py-2 pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>
            <button
              type="button"
              onClick={() => { setShowSearch(false); setSearchQuery(""); }}
              className="text-white/50 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">DevForge</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {!showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/70 hover:bg-white/10 hover:text-white transition-all"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
          <BellButton mobile />
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-xs font-bold text-white">
            {initials}
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            placeholder="Search challenges, users, or skills..."
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-violet-500/40 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(""); onSearch?.(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-3">
          <BellButton />

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-sm font-semibold text-white">
              {initials}
            </div>
            <div>
              <p className="text-sm text-white">{username}</p>
              <p className="text-xs text-white/50">
                @{username.toLowerCase().replace(/\s+/g, "")}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}