import { Bell, Search } from "lucide-react";

type Props = {
  username: string;
  onLogout: () => void;
};

export function TopNavbar({ username, onLogout }: Props) {
  const initials = username
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <header className="border-b border-white/10 bg-black/30 px-6 py-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            placeholder="Search challenges, users, or skills..."
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/70 transition hover:bg-white/10 hover:text-white">
            <Bell className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-sm font-semibold text-white">
              {initials}
            </div>

            <div className="hidden sm:block">
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