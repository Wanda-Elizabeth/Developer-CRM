import {
  Mail,
  MapPin,
  Calendar,
  Globe,
  Award,
  Trophy,
  Flame,
  Star,
  } from "lucide-react";
import type { ElementType } from "react";

type ProfileStats = {
  totalChallenges: number;
  totalSubmissions: number;
  totalLikes: number;
  streak: number;
  username: string;
};

type Props = {
  stats: ProfileStats;
};

const achievements: {
  id: number;
  title: string;
  description: string;
  icon: ElementType;
  unlocked: boolean;
}[] = [
  {
    id: 1,
    title: "First Submission",
    description: "Submitted your first solution",
    icon: Star,
    unlocked: true,
  },
  {
    id: 2,
    title: "Week Warrior",
    description: "Maintained a 7-day streak",
    icon: Flame,
    unlocked: true,
  },
  {
    id: 3,
    title: "Code Master",
    description: "Completed 50 challenges",
    icon: Trophy,
    unlocked: false,
  },
  {
    id: 4,
    title: "Top Contributor",
    description: "Ranked in top 10",
    icon: Award,
    unlocked: true,
  },
];

const skills = [
  { name: "TypeScript", level: 85 },
  { name: "React", level: 92 },
  { name: "Node.js", level: 78 },
  { name: "System Design", level: 65 },
  { name: "GraphQL", level: 70 },
];

export function ProfilePage({ stats }: Props) {
  const acceptanceRate =
    stats.totalSubmissions > 0
      ? Math.min(
          100,
          Math.max(
            60,
            70 + Math.floor(stats.totalLikes / Math.max(stats.totalSubmissions, 1))
          )
        )
      : 0;

  const totalPoints = stats.totalSubmissions * 50 + stats.totalLikes * 12;
  const globalRank = stats.totalSubmissions > 0 ? "#3" : "—";
  const longestStreak = Math.max(stats.streak, 14);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-3xl font-bold text-white">Profile</h1>
        <p className="text-white/60">Manage your account and view your progress</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mb-6 flex flex-col gap-6 xl:flex-row xl:items-start">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600">
                <span className="text-3xl font-medium text-white">
                  {stats.username
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>

              <div className="flex-1">
                <h2 className="mb-1 text-2xl font-semibold text-white">{stats.username}</h2>
                <p className="mb-4 text-white/60">
                  @{stats.username.toLowerCase().replace(/\s+/g, "")}
                </p>

                <p className="mb-4 text-white/80">
                  Full-stack developer passionate about building scalable web
                  applications and solving complex problems. Love TypeScript,
                  React, and system design.
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    San Francisco, CA
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined March 2025
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    alex@example.com
                  </div>
                </div>
              </div>

              <button className="rounded-lg bg-violet-500 px-4 py-2 text-white transition-opacity hover:opacity-90">
                Edit Profile
              </button>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-white/10 pt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white transition-colors hover:bg-white/10"
              >
                <Globe className="h-4 w-4" />
                GitHub
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white transition-colors hover:bg-white/10"
              >
                <Globe className="h-4 w-4" />
                LinkedIn
              </a>

              <a
                href="https://example.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white transition-colors hover:bg-white/10"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="mb-4 text-lg font-semibold text-white">Skills</h3>

            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-white">{skill.name}</span>
                    <span className="text-sm text-white/60">{skill.level}%</span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-600 transition-all"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="mb-4 text-lg font-semibold text-white">Achievements</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;

                return (
                  <div
                    key={achievement.id}
                    className={`rounded-lg border p-4 transition-all ${
                      achievement.unlocked
                        ? "border-violet-500/30 bg-violet-500/10"
                        : "border-white/10 bg-white/5 opacity-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-lg p-2 ${
                          achievement.unlocked ? "bg-violet-500/20" : "bg-white/5"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            achievement.unlocked ? "text-violet-400" : "text-white/40"
                          }`}
                        />
                      </div>

                      <div>
                        <p className="mb-1 text-sm font-medium text-white">
                          {achievement.title}
                        </p>
                        <p className="text-xs text-white/60">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="mb-4 text-lg font-semibold text-white">Statistics</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Total Points</span>
                <span className="font-semibold text-white">
                  {totalPoints.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Global Rank</span>
                <span className="font-semibold text-violet-400">{globalRank}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Submissions</span>
                <span className="font-semibold text-white">{stats.totalSubmissions}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Acceptance Rate</span>
                <span className="font-semibold text-emerald-400">
                  {acceptanceRate}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Current Streak</span>
                <span className="font-semibold text-orange-400">
                  {stats.streak} days
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Longest Streak</span>
                <span className="font-semibold text-white">
                  {longestStreak} days
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-blue-600/10 p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Premium Member</h3>
            <p className="mb-4 text-sm text-white/60">
              Enjoying premium features including advanced analytics and priority
              support.
            </p>

            <button className="w-full rounded-lg bg-white/10 py-2 text-white transition-colors hover:bg-white/20">
              Manage Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}