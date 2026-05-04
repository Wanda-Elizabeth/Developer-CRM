import {
  LayoutDashboard,
  Code2,
  Upload,
  Trophy,
  User,
  Briefcase,
  MessageSquare,

} from "lucide-react";

export type ActiveView =
  | "dashboard"
  | "challenges"
  | "submissions"
  | "leaderboard"
  | "profile"
  | "jobs"
  | "community";

type Props = {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
};

const navItems: {
  key: ActiveView;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "challenges", label: "Weekly Challenges", icon: Code2 },
  { key: "submissions", label: "Submissions", icon: Upload },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy },
  { key: "jobs", label: "Job Board", icon: Briefcase },
  {key: "community", label: "Community", icon: MessageSquare },
  { key: "profile", label: "Profile", icon: User },
];

export function Sidebar({ activeView, onNavigate }: Props) {
  return (
    <aside className="hidden w-[260px] border-r border-white/10 bg-black/40 px-4 py-5 lg:flex lg:flex-col">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-400">
          🏆
        </div>

        <div>
          <p className="text-lg font-semibold text-white">DevBuild</p>
          <p className="text-xs text-white/50">Developer CRM</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-all ${
                active
                  ? "border border-violet-500/30 bg-violet-500/10 text-violet-300"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* <div className="mt-auto rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-blue-600/10 p-4">
        <p className="text-xs text-white/50">Upgrade to Pro</p>
        <p className="mt-2 text-sm text-white">
          Unlock premium challenges and analytics
        </p>
        <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-medium text-white">
          Upgrade Now
        </button>
      </div> */}
    </aside>
  );
}