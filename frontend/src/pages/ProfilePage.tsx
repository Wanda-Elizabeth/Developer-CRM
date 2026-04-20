import {
  Mail,
  MapPin,
  Calendar,
  Globe,
} from "lucide-react";

type UserProfile = {
  username: string;
  totalChallenges: number;
  totalSubmissions: number;
  totalLikes: number;
  streak: number;

  globalRank?: string;
  longestStreak?: number;

  bio?: string;
  location?: string;
  email?: string;
  joinedAt?: string;

  github?: string;
  linkedin?: string;
  website?: string;

  skills?: { name: string; level: number }[];

  achievements?: {
    id: number;
    title: string;
    description: string;
    unlocked: boolean;
  }[];
};

type Props = {
  stats: UserProfile;
};

export function ProfilePage({ stats }: Props) {
  const acceptanceRate =
    stats.totalSubmissions > 0
      ? Math.min(
          100,
          Math.max(
            60,
            70 + Math.floor(stats.totalLikes / stats.totalSubmissions)
          )
        )
      : 0;

  const totalPoints = stats.totalSubmissions * 50 + stats.totalLikes * 12;

  const globalRank =
    stats.totalSubmissions > 0 ? stats.globalRank ?? "—" : "—";

  const longestStreak = stats.longestStreak ?? stats.streak;

  const initials =
    stats.username
      ?.split(" ")
      ?.map((p) => p[0])
      ?.join("")
      ?.slice(0, 2) || "U";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-3xl font-bold text-white">Profile</h1>
        <p className="text-white/60">
          Manage your account and view your progress
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-6 lg:col-span-2">
          {/* PROFILE CARD */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mb-6 flex flex-col gap-6 xl:flex-row xl:items-start">
              {/* AVATAR */}
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600">
                <span className="text-3xl text-white">{initials}</span>
              </div>

              {/* INFO */}
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-white">
                  {stats.username}
                </h2>

                <p className="mb-3 text-white/60">
                  @{stats.username.toLowerCase().replace(/\s+/g, "")}
                </p>

                <p className="mb-4 text-white/80">
                  {stats.bio || "No bio added yet"}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {stats.location || "—"}
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {stats.joinedAt
                      ? `Joined ${new Date(
                          stats.joinedAt
                        ).toLocaleDateString()}`
                      : "—"}
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {stats.email || "—"}
                  </div>
                </div>
              </div>

              <button className="rounded-lg bg-violet-500 px-4 py-2 text-white">
                Edit Profile
              </button>
            </div>

            {/* SOCIAL LINKS (FIXED) */}
            <div className="flex flex-wrap gap-3 border-t border-white/10 pt-4">
              {stats.github && (
                <a
                  href={stats.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white hover:bg-white/10"
                >
                  <Globe className="h-4 w-4" />
                  GitHub
                </a>
              )}

              {stats.linkedin && (
                <a
                  href={stats.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white hover:bg-white/10"
                >
                  <Globe className="h-4 w-4" />
                  LinkedIn
                </a>
              )}

              {stats.website && (
                <a
                  href={stats.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white hover:bg-white/10"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
            </div>
          </div>

          {/* SKILLS */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Skills</h3>

            {stats.skills?.length ? (
              <div className="space-y-4">
                {stats.skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm">
                      <span className="text-white">{skill.name}</span>
                      <span className="text-white/60">
                        {skill.level}%
                      </span>
                    </div>

                    <div className="h-2 bg-white/10 rounded-full">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-600"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-sm">
                No skills added yet
              </p>
            )}
          </div>

          {/* ACHIEVEMENTS (NOW DYNAMIC) */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Achievements
            </h3>

            {stats.achievements?.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {stats.achievements.map((a) => (
                  <div
                    key={a.id}
                    className={`rounded-lg border p-4 ${
                      a.unlocked
                        ? "border-violet-500/30 bg-violet-500/10"
                        : "border-white/10 bg-white/5 opacity-50"
                    }`}
                  >
                    <p className="text-white text-sm font-medium">
                      {a.title}
                    </p>
                    <p className="text-xs text-white/60">
                      {a.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-sm">
                No achievements yet
              </p>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Statistics
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Total Points</span>
                <span className="text-white">
                  {totalPoints.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-white/60">Global Rank</span>
                <span className="text-violet-400">{globalRank}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-white/60">Submissions</span>
                <span className="text-white">
                  {stats.totalSubmissions}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-white/60">
                  Acceptance Rate
                </span>
                <span className="text-emerald-400">
                  {acceptanceRate}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-white/60">Current Streak</span>
                <span className="text-orange-400">
                  {stats.streak} days
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-white/60">
                  Longest Streak
                </span>
                <span className="text-white">
                  {longestStreak} days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}