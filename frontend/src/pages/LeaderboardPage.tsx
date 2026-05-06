import { useState } from "react";
import { Trophy, Medal, Award, Search, X } from "lucide-react";
import type { LeaderboardEntry } from "../App";

type Props = {
  leaderboard: LeaderboardEntry[];
  currentUsername?: string;
  searchQuery?: string;
};

export function LeaderboardPage({ leaderboard, currentUsername, searchQuery = "" }: Props) {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("week");
  const [localSearch, setLocalSearch] = useState("");

  // Use external searchQuery OR local search
  const activeQuery = searchQuery.trim() || localSearch.trim();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <span className="w-6 text-center text-sm text-white/40">{rank}</span>;
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30";
      case 2: return "bg-gradient-to-r from-gray-500/10 to-slate-500/10 border-gray-500/30";
      case 3: return "bg-gradient-to-r from-amber-600/10 to-orange-600/10 border-amber-600/30";
      default: return "bg-white/5 border-white/10";
    }
  };

  // ✅ Filter by search
  const filtered = leaderboard.filter((user) => {
    if (!activeQuery) return true;
    const q = activeQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(q) ||
      user.full_name.toLowerCase().includes(q)
    );
  });

  const highlight = (text: string) => {
    if (!activeQuery) return text;
    const parts = text.split(new RegExp(`(${activeQuery})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === activeQuery.toLowerCase() ? (
        <mark key={i} className="bg-violet-500/30 text-violet-200 rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-white/60">
            Top developers based on points and submissions
          </p>
        </div>

        <div className="flex gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
          {(["week", "month", "all"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`rounded-lg px-4 py-2 text-sm transition-all ${
                timeframe === period
                  ? "bg-violet-500 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {period === "week" ? "This Week" : period === "month" ? "This Month" : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {/* Local search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by name or username..."
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white outline-none placeholder:text-white/25 focus:border-violet-500/40 transition-all"
        />
        {localSearch && (
          <button
            onClick={() => setLocalSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Search result count */}
      {activeQuery && (
        <p className="text-sm text-white/40">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for{" "}
          <span className="text-violet-400 font-medium">"{activeQuery}"</span>
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center">
          <div className="mb-3 text-3xl">{activeQuery ? "🔍" : "🏆"}</div>
          <h2 className="text-lg font-semibold text-white">
            {activeQuery ? `No results for "${activeQuery}"` : "No data yet"}
          </h2>
          <p className="mt-2 text-sm text-white/60">
            {activeQuery
              ? "Try a different name or username"
              : "Complete challenges to appear on the leaderboard."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <div
              key={user.username}
              className={`rounded-xl border p-4 sm:p-6 backdrop-blur-xl transition-all hover:border-violet-500/30 ${getRankBackground(user.rank)} ${
                user.username === currentUsername ? "ring-1 ring-violet-500/40" : ""
              }`}
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex w-10 sm:w-12 items-center justify-center flex-shrink-0">
                    {getRankIcon(user.rank)}
                  </div>

                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600">
                    <span className="font-medium text-white text-sm">
                      {user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-white font-semibold">
                      {highlight(user.full_name)}
                      {user.username === currentUsername && (
                        <span className="ml-2 text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-white/50">@{highlight(user.username)}</p>
                  </div>
                </div>

                <div className="flex flex-1 items-center justify-start gap-6 sm:gap-8 text-center xl:justify-end">
                  <div>
                    <p className="mb-1 text-xl sm:text-2xl font-bold text-white">{user.points.toLocaleString()}</p>
                    <p className="text-xs text-white/50">Points</p>
                  </div>
                  <div>
                    <p className="mb-1 text-lg sm:text-xl font-bold text-violet-400">{user.submissions}</p>
                    <p className="text-xs text-white/50">Submissions</p>
                  </div>
                  <div>
                    <p className="mb-1 text-lg sm:text-xl font-bold text-orange-400">{user.streak}</p>
                    <p className="text-xs text-white/50">Day Streak</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}