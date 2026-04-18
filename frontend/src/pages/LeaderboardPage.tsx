import { useMemo, useState } from "react";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import type { Challenge } from "../App";

type Props = {
  challenges: Challenge[];
  currentUsername?: string;
};

type LeaderboardUser = {
  rank: number;
  username: string;
  fullName: string;
  points: number;
  submissions: number;
  streak: number;
  change: number;
};

function titleCase(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function LeaderboardPage({
  challenges,
  currentUsername = "Alex Chen",
}: Props) {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("week");

  const leaderboardData = useMemo<LeaderboardUser[]>(() => {
    const map = new Map<
      string,
      {
        username: string;
        likes: number;
        submissions: number;
        lastSubmissionAt?: number;
      }
    >();

    for (const challenge of challenges) {
      for (const submission of challenge.submissions) {
        const key = submission.user_name || "guest";
        const existing = map.get(key);
        const createdAt = submission.created_at
          ? new Date(submission.created_at).getTime()
          : undefined;

        if (existing) {
          existing.likes += submission.likes || 0;
          existing.submissions += 1;

          if (createdAt) {
            existing.lastSubmissionAt = Math.max(
              existing.lastSubmissionAt || 0,
              createdAt
            );
          }
        } else {
          map.set(key, {
            username: key,
            likes: submission.likes || 0,
            submissions: 1,
            lastSubmissionAt: createdAt,
          });
        }
      }
    }

    const users = Array.from(map.values()).map((user, index) => {
      const pseudoStreak = Math.max(
        1,
        Math.min(30, user.submissions + Math.floor(user.likes / 4))
      );

      const points = user.submissions * 50 + user.likes * 12;
      const change = (index % 5) - 2;

      return {
        username: user.username,
        fullName:
          user.username.toLowerCase() === "guest"
            ? "Guest Developer"
            : titleCase(user.username),
        points,
        submissions: user.submissions,
        streak: pseudoStreak,
        change,
      };
    });

    const fallbackUsers = [
      {
        username: "sarah_dev",
        fullName: "Sarah Johnson",
        points: 2847,
        submissions: 67,
        streak: 21,
        change: 2,
      },
      {
        username: "codemaster",
        fullName: "Mike Chen",
        points: 2691,
        submissions: 58,
        streak: 14,
        change: -1,
      },
      {
        username: "alexchen",
        fullName: currentUsername,
        points: 2534,
        submissions: 47,
        streak: 7,
        change: 1,
      },
      {
        username: "backend_pro",
        fullName: "David Kim",
        points: 2398,
        submissions: 52,
        streak: 9,
        change: 0,
      },
      {
        username: "frontend_dev",
        fullName: "Emma Wilson",
        points: 2156,
        submissions: 44,
        streak: 12,
        change: 3,
      },
    ];

    const merged = users.length > 0 ? users : fallbackUsers;

    return merged
      .sort((a, b) => b.points - a.points)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
  }, [challenges, currentUsername, timeframe]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="w-6 text-center text-sm text-white/40">{rank}</span>;
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

      <div className="space-y-3">
        {leaderboardData.map((user) => (
          <div
            key={`${user.username}-${user.rank}`}
            className={`rounded-xl border p-6 backdrop-blur-xl transition-all hover:border-violet-500/30 ${getRankBackground(
              user.rank
            )}`}
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
              <div className="flex items-center gap-6">
                <div className="flex w-12 items-center justify-center">
                  {getRankIcon(user.rank)}
                </div>

                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600">
                  <span className="font-medium text-white">
                    {user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white">{user.fullName}</h3>
                    {user.change !== 0 && (
                      <span
                        className={`flex items-center gap-1 text-xs ${
                          user.change > 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        <TrendingUp
                          className={`h-3 w-3 ${user.change < 0 ? "rotate-180" : ""}`}
                        />
                        {Math.abs(user.change)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-white/60">@{user.username}</p>
                </div>
              </div>

              <div className="flex flex-1 items-center justify-start gap-8 text-center xl:justify-end">
                <div>
                  <p className="mb-1 text-2xl font-semibold text-white">{user.points}</p>
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
    </div>
  );
}