import type { Challenge } from "../App";

type Props = {
  challenges: Challenge[];
  loading: boolean;
  openSubmitModal: (challenge: Challenge) => void;
  setViewSubmissions: (challenge: Challenge) => void;
  searchQuery?: string;
};

export function WeeklyChallengesPage({
  challenges,
  loading,
  openSubmitModal,
  setViewSubmissions,
  searchQuery = "",
}: Props) {
  const getDifficultyClass = (difficulty: string) => {
    const value = difficulty.toLowerCase();
    if (value === "easy" || value === "beginner")
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (value === "medium" || value === "intermediate")
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    if (value === "hard")
      return "text-red-400 bg-red-500/10 border-red-500/20";
    return "text-zinc-300 bg-zinc-700/20 border-zinc-700/30";
  };

  // ✅ Filter challenges by search query
  const filtered = challenges.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.difficulty.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-3xl font-bold text-white">Weekly Challenges</h1>
        <p className="text-white/60">
          Sharpen your skills with curated coding challenges
        </p>
      </div>

      {/* Search result info */}
      {searchQuery.trim() && (
        <div className="flex items-center gap-2 text-sm text-white/50">
          <span>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for{" "}
            <span className="text-violet-400 font-medium">"{searchQuery}"</span>
          </span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="mb-4 h-6 w-1/2 animate-pulse rounded bg-white/10" />
              <div className="mb-2 h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="mb-8 h-4 w-4/5 animate-pulse rounded bg-white/5" />
              <div className="flex justify-between gap-3">
                <div className="h-10 w-36 animate-pulse rounded-xl bg-white/10" />
                <div className="h-10 w-20 animate-pulse rounded-xl bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center">
          <div className="mb-3 text-3xl">
            {searchQuery.trim() ? "🔍" : "🚀"}
          </div>
          <h2 className="text-lg font-semibold text-white">
            {searchQuery.trim()
              ? `No challenges match "${searchQuery}"`
              : "No challenges yet"}
          </h2>
          <p className="mt-2 text-sm text-white/60">
            {searchQuery.trim()
              ? "Try a different search term"
              : "Once challenges are added, they'll show up here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filtered.map((challenge) => (
            <div
              key={challenge.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:border-violet-500/30"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">
                  {/* Highlight matching text */}
                  {searchQuery.trim()
                    ? challenge.title
                        .split(new RegExp(`(${searchQuery})`, "gi"))
                        .map((part, i) =>
                          part.toLowerCase() === searchQuery.toLowerCase() ? (
                            <mark
                              key={i}
                              className="bg-violet-500/30 text-violet-200 rounded px-0.5"
                            >
                              {part}
                            </mark>
                          ) : (
                            part
                          )
                        )
                    : challenge.title}
                </h3>
                <span
                  className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs ${getDifficultyClass(
                    challenge.difficulty
                  )}`}
                >
                  {challenge.difficulty}
                </span>
              </div>

              <p className="mb-6 text-sm leading-6 text-white/60">
                {challenge.description}
              </p>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => openSubmitModal(challenge)}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-all"
                >
                  Submit Solution →
                </button>
                <button
                  onClick={() => setViewSubmissions(challenge)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-all"
                >
                  👥 {challenge.submissions.length}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}