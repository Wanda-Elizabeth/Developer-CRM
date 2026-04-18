import {
  Upload,
  Heart,
  Flame,
  Clock3,
} from "lucide-react";
import type { ElementType } from "react";
import type {
  Challenge,
  WeeklyActivityItem,
  RecentActivityItem,
} from "../App";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Props = {
  stats: {
    totalChallenges: number;
    totalSubmissions: number;
    totalLikes: number;
    streak: number;
    username: string;
  };
  challenges: Challenge[];
  weeklyActivity: WeeklyActivityItem[];
  recentActivity: RecentActivityItem[];
  loading?: boolean;
};

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: ElementType;
  trend?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
            {trend}
          </span>
        )}
      </div>

      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-white/50">{title}</p>
    </div>
  );
}

function formatRelativeTime(value: string | null) {
  if (!value) return "Recently";

  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export function DashboardPage({
  stats,
  weeklyActivity,
  recentActivity,
  loading = false,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-3xl font-bold text-white">
          Welcome back, {stats.username}! 👋
        </h1>
        <p className="text-white/60">Here&apos;s your developer activity overview</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Submissions"
          value={stats.totalSubmissions}
          icon={Upload}
          trend="+12%"
        />
        <StatCard
          title="Likes Received"
          value={stats.totalLikes}
          icon={Heart}
          trend="+8%"
        />
        <StatCard
          title="Current Streak"
          value={`${stats.streak} days`}
          icon={Flame}
          trend="Best"
        />
        <StatCard
          title="Avg. Response Time"
          value="2.4h"
          icon={Clock3}
          trend="-15%"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="mb-4 text-lg font-semibold text-white">Weekly Activity</h2>

        <div className="h-[320px]">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-white/50">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyActivity}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={true} />
                <XAxis
                  dataKey="day"
                  stroke="rgba(255,255,255,0.35)"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.35)"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#09090b",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#8b5cf6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="mb-4 text-lg font-semibold text-white">Recent Activity</h2>

        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/50">
              No recent activity yet.
            </div>
          ) : (
            recentActivity.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      index % 4 === 0
                        ? "bg-emerald-400"
                        : index % 4 === 1
                        ? "bg-pink-400"
                        : index % 4 === 2
                        ? "bg-blue-400"
                        : "bg-yellow-400"
                    }`}
                  />
                  <p className="text-sm text-white">{item.title}</p>
                </div>

                <span className="text-xs text-white/40">
                  {formatRelativeTime(item.time)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}