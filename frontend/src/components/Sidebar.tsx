import type { ElementType } from "react";
import {
  LayoutDashboard,
  Code2,
  Upload,
  Trophy,
  User,
  Briefcase,
  MessageSquare,
  Hash,
  X,
  LogOut,
} from "lucide-react";

export type ActiveView =
  | "dashboard"
  | "challenges"
  | "submissions"
  | "leaderboard"
  | "profile"
  | "jobs"
  | "chat"
  | "community";

type Props = {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  chatUnread?: number;
  onLogout: () => void;
};

const navItems: { key: ActiveView; label: string; icon: ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "challenges", label: "Weekly Challenges", icon: Code2 },
  { key: "submissions", label: "Submissions", icon: Upload },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy },
  { key: "jobs", label: "Job Board", icon: Briefcase },
  { key: "community", label: "Community", icon: MessageSquare },
  { key: "chat", label: "Global Chat", icon: Hash },
  { key: "profile", label: "Profile", icon: User },
];

export function Sidebar({
  activeView,
  onNavigate,
  mobileOpen,
  onMobileClose,
  chatUnread = 0,
  onLogout,
}: Props) {
  const handleNavigate = (view: ActiveView) => {
    onNavigate(view);
    onMobileClose();
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] border-r border-white/10 bg-black/40 px-4 py-5 lg:flex lg:flex-col">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-400">
            🏆
          </div>
          <div>
            <p className="text-lg font-semibold text-white">DevForge</p>
            <p className="text-xs text-white/50">Developer Growth Platform</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.key;
            const showBadge = item.key === "chat" && chatUnread > 0;

            return (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-all ${
                  active
                    ? "border border-violet-500/30 bg-violet-500/10 text-violet-300"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>

                {showBadge && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-violet-500 px-1.5 text-[10px] font-black text-white">
                    {chatUnread > 99 ? "99+" : chatUnread}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/10 bg-[#0a0a0f] transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/8 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-400">
              🏆
            </div>
            <div>
              <p className="text-base font-bold text-white">DevForge</p>
              <p className="text-xs text-white/50">Developer Growth Platform</p>
            </div>
          </div>

          <button
            onClick={onMobileClose}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile nav items */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.key;
              const showBadge = item.key === "chat" && chatUnread > 0;

              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-all ${
                    active
                      ? "border border-violet-500/30 bg-violet-500/10 text-violet-300"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>

                  {showBadge && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-violet-500 px-1.5 text-[10px] font-black text-white">
                      {chatUnread > 99 ? "99+" : chatUnread}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile logout button at bottom */}
        <div className="flex-shrink-0 border-t border-white/8 p-3">
          <button
            onClick={() => {
              onLogout();
              onMobileClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-red-400 transition-all hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}