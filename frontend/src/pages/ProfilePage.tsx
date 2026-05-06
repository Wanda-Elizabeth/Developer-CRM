import { useState } from "react";
import {
  Mail,
  MapPin,
  Calendar,
  Globe,
  Pencil,
  X,
  Plus,
  Trash2,
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
  apiBase?: string;
  token?: string | null;
};

export function ProfilePage({ stats, apiBase, token }: Props) {
  const [profile, setProfile] = useState<UserProfile>(stats);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Edit form state
  const [form, setForm] = useState({
    bio: stats.bio || "",
    location: stats.location || "",
    github: stats.github || "",
    linkedin: stats.linkedin || "",
    website: stats.website || "",
  });

  const [skills, setSkills] = useState<{ name: string; level: number }[]>(
    stats.skills || []
  );
  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(75);

  const acceptanceRate =
    profile.totalSubmissions > 0
      ? Math.min(100, Math.max(60, 70 + Math.floor(profile.totalLikes / profile.totalSubmissions)))
      : 0;

  const totalPoints = profile.totalSubmissions * 50 + profile.totalLikes * 12;
  const globalRank = profile.totalSubmissions > 0 ? profile.globalRank ?? "—" : "—";
  const longestStreak = profile.longestStreak ?? profile.streak;

  const initials =
    profile.username?.split(" ").map((p) => p[0]).join("").slice(0, 2) || "U";

  const openEdit = () => {
    setForm({
      bio: profile.bio || "",
      location: profile.location || "",
      github: profile.github || "",
      linkedin: profile.linkedin || "",
      website: profile.website || "",
    });
    setSkills(profile.skills || []);
    setSaveError("");
    setEditing(true);
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (skills.find((s) => s.name.toLowerCase() === newSkill.toLowerCase())) return;
    setSkills([...skills, { name: newSkill.trim(), level: newSkillLevel }]);
    setNewSkill("");
    setNewSkillLevel(75);
  };

  const removeSkill = (name: string) => {
    setSkills(skills.filter((s) => s.name !== name));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError("");

      // If API is available, save to backend
      if (apiBase && token) {
        const res = await fetch(`${apiBase}/profile/update/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...form, skills }),
        });

        if (!res.ok) throw new Error("Failed to save");
      }

      // Update local state regardless
      setProfile((prev) => ({
        ...prev,
        ...form,
        skills,
      }));

      setEditing(false);
    } catch (err) {
      setSaveError("Could not save. Changes saved locally only.");
      // Still update locally so user sees their changes
      setProfile((prev) => ({ ...prev, ...form, skills }));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-3xl font-bold text-white">Profile</h1>
        <p className="text-white/60">Manage your account and view your progress</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-6 lg:col-span-2">

          {/* PROFILE CARD */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mb-6 flex flex-col gap-6 xl:flex-row xl:items-start">
              {/* AVATAR */}
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600">
                <span className="text-3xl font-bold text-white">{initials}</span>
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white">{profile.username}</h2>
                <p className="mb-3 text-white/50">
                  @{profile.username.toLowerCase().replace(/\s+/g, "")}
                </p>
                <p className="mb-4 text-white/70 text-sm leading-relaxed">
                  {profile.bio || "No bio added yet — click Edit Profile to add one."}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-white/50">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {profile.location || "Location not set"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {profile.joinedAt
                      ? `Joined ${new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                      : "—"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {profile.email || "—"}
                  </div>
                </div>
              </div>

              <button
                onClick={openEdit}
                className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-300 hover:bg-violet-500/20 transition-all flex-shrink-0"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            </div>

            {/* SOCIAL LINKS */}
            {(profile.github || profile.linkedin || profile.website) ? (
              <div className="flex flex-wrap gap-3 border-t border-white/10 pt-4">
                {profile.github && (
                  
                    <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition-all"
                  >
                    <Globe className="h-4 w-4" />
                    GitHub
                  </a>
                )}
                {profile.linkedin && (
                  
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition-all"
                  >
                    <Globe className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition-all"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
            ) : (
              <div className="border-t border-white/10 pt-4">
                <button
                  onClick={openEdit}
                  className="text-sm text-white/30 hover:text-white/60 transition-colors"
                >
                  + Add GitHub, LinkedIn or website
                </button>
              </div>
            )}
          </div>

          {/* SKILLS */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Skills</h3>
              <button
                onClick={openEdit}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            </div>

            {profile.skills?.length ? (
              <div className="space-y-4">
                {profile.skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-white font-medium">{skill.name}</span>
                      <span className="text-white/50">{skill.level}%</span>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-white/40 text-sm mb-3">No skills added yet</p>
                <button
                  onClick={openEdit}
                  className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >
                  + Add your first skill
                </button>
              </div>
            )}
          </div>

          {/* ACHIEVEMENTS */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Achievements</h3>
            {profile.achievements?.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {profile.achievements.map((a) => (
                  <div
                    key={a.id}
                    className={`rounded-xl border p-4 ${
                      a.unlocked
                        ? "border-violet-500/30 bg-violet-500/10"
                        : "border-white/8 bg-white/3 opacity-40"
                    }`}
                  >
                    <p className="text-white text-sm font-semibold">{a.title}</p>
                    <p className="text-xs text-white/50 mt-1">{a.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-white/40 text-sm">
                  Complete challenges to unlock achievements
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — STATS */}
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-5 text-lg font-semibold text-white">Statistics</h3>
            <div className="space-y-4 text-sm">
              {[
                { label: "Total Points", value: totalPoints.toLocaleString(), color: "text-white" },
                { label: "Global Rank", value: globalRank, color: "text-violet-400" },
                { label: "Submissions", value: profile.totalSubmissions.toString(), color: "text-white" },
                { label: "Acceptance Rate", value: `${acceptanceRate}%`, color: "text-emerald-400" },
                { label: "Current Streak", value: `${profile.streak} days`, color: "text-orange-400" },
                { label: "Longest Streak", value: `${longestStreak} days`, color: "text-white" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-white/50">{stat.label}</span>
                  <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COMPLETION CARD */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-3 text-sm font-semibold text-white">Profile Completion</h3>
            {(() => {
              const fields = [
                !!profile.bio,
                !!profile.location,
                !!profile.github,
                !!(profile.skills?.length),
              ];
              const completed = fields.filter(Boolean).length;
              const pct = Math.round((completed / fields.length) * 100);
              return (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/40">{completed}/{fields.length} complete</span>
                    <span className="text-xs font-bold text-violet-400">{pct}%</span>
                  </div>
                  <div className="h-2 bg-white/8 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Bio", done: !!profile.bio },
                      { label: "Location", done: !!profile.location },
                      { label: "GitHub link", done: !!profile.github },
                      { label: "Skills added", done: !!(profile.skills?.length) },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-xs">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.done ? "bg-emerald-500" : "bg-white/10"
                        }`}>
                          {item.done && <span className="text-white text-[8px]">✓</span>}
                        </div>
                        <span className={item.done ? "text-white/50 line-through" : "text-white/60"}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {pct < 100 && (
                    <button
                      onClick={openEdit}
                      className="mt-4 w-full rounded-xl bg-violet-500/10 border border-violet-500/20 py-2 text-xs font-semibold text-violet-400 hover:bg-violet-500/20 transition-all"
                    >
                      Complete your profile →
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <h2 className="text-lg font-bold text-white">Edit Profile</h2>
              <button
                onClick={() => setEditing(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body — scrollable */}
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell developers who you are..."
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-violet-500/50 resize-none"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                  Location
                </label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Nairobi, Kenya"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-violet-500/50"
                />
              </div>

              {/* GitHub */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                  GitHub URL
                </label>
                <input
                  value={form.github}
                  onChange={(e) => setForm({ ...form, github: e.target.value })}
                  placeholder="https://github.com/yourusername"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-violet-500/50"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                  LinkedIn URL
                </label>
                <input
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-violet-500/50"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                  Website
                </label>
                <input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-violet-500/50"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                  Skills
                </label>

                {/* Existing skills */}
                <div className="space-y-2 mb-3">
                  {skills.map((skill) => (
                    <div key={skill.name} className="flex items-center gap-3">
                      <span className="text-sm text-white w-24 flex-shrink-0">{skill.name}</span>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={skill.level}
                        onChange={(e) =>
                          setSkills(skills.map((s) =>
                            s.name === skill.name
                              ? { ...s, level: Number(e.target.value) }
                              : s
                          ))
                        }
                        className="flex-1 accent-violet-500"
                      />
                      <span className="text-xs text-white/40 w-8 text-right">{skill.level}%</span>
                      <button
                        onClick={() => removeSkill(skill.name)}
                        className="text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new skill */}
                <div className="flex gap-2">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    placeholder="e.g. React, Django, TypeScript..."
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-violet-500/50"
                  />
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                    className="w-16 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none text-center"
                  />
                  <button
                    onClick={addSkill}
                    className="rounded-xl bg-violet-500/20 border border-violet-500/30 px-3 py-2.5 text-violet-300 hover:bg-violet-500/30 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-white/25 mt-1.5">
                  Press Enter or click + to add a skill. Set level 0–100.
                </p>
              </div>

              {saveError && (
                <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                  {saveError}
                </p>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/8">
              <button
                onClick={() => setEditing(false)}
                className="rounded-xl px-5 py-2.5 text-sm text-white/40 hover:bg-white/5 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}