import { useState } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import type { LeaderboardEntry } from "../App";

type Props = {
  leaderboard: LeaderboardEntry[];
  currentUsername?: string;
};

export function LeaderboardPage({ leaderboard, currentUsername }: Props) {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("week");

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 text-center text-sm text-white/40">{rank}</span>
        );
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-r from-gray-500/10 to-slate-500/10 border-gray-500/30";
      case 3:
        return "bg-gradient-to-r from-amber-600/10 to-orange-600/10 border-amber-600/30";
      default:
        return "bg-white/5 border-white/10";
    }
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
              {period === "week"
                ? "This Week"
                : period === "month"
                ? "This Month"
                : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center">
          <div className="mb-3 text-3xl">🏆</div>
          <h2 className="text-lg font-semibold text-white">No data yet</h2>
          <p className="mt-2 text-sm text-white/60">
            Complete challenges to appear on the leaderboard.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((user) => (
            <div
              key={user.username}
              className={`rounded-xl border p-6 backdrop-blur-xl transition-all hover:border-violet-500/30 ${getRankBackground(
                user.rank
              )} ${
                user.username === currentUsername
                  ? "ring-1 ring-violet-500/40"
                  : ""
              }`}
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                <div className="flex items-center gap-6">
                  <div className="flex w-12 items-center justify-center">
                    {getRankIcon(user.rank)}
                  </div>

                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600">
                    <span className="font-medium text-white">
                      {user.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-white">{user.full_name}</h3>
                    <p className="text-sm text-white/60">@{user.username}</p>
                  </div>
                </div>

                <div className="flex flex-1 items-center justify-start gap-8 text-center xl:justify-end">
                  <div>
                    <p className="mb-1 text-2xl font-semibold text-white">
                      {user.points}
                    </p>
                    <p className="text-xs text-white/60">Points</p>
                  </div>

                  <div>
                    <p className="mb-1 text-xl font-semibold text-violet-400">
                      {user.submissions}
                    </p>
                    <p className="text-xs text-white/60">Submissions</p>
                  </div>

                  <div>
                    <p className="mb-1 text-xl font-semibold text-orange-400">
                      {user.streak}
                    </p>
                    <p className="text-xs text-white/60">Day Streak</p>
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