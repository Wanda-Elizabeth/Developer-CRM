type RightPanelProps = {
  recommendedChallenges: {
    title: string;
    difficulty: string;
  }[];
  trendingSkills: {
    name: string;
    count: number;
  }[];
  streak: number;
};

export function RightPanel({
  recommendedChallenges,
  trendingSkills,
  streak,
}: RightPanelProps) {
  return (
    <aside className="hidden w-[260px] border-l border-white/10 bg-black/20 p-4 xl:block">
      <div className="space-y-6">

        {/* Recommended Challenges */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-white/80">
            ⚡ Recommended Challenges
          </h3>

          <div className="space-y-3">
            {recommendedChallenges?.length ? (
              recommendedChallenges.map((challenge) => (
                <div
                  key={challenge.title}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-sm text-white">{challenge.title}</p>
                  <p className="mt-2 text-xs text-violet-400">
                    {challenge.difficulty}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-white/40">
                No recommendations yet
              </p>
            )}
          </div>
        </div>

        {/* Trending Skills */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-white/80">
            📈 Trending Skills
          </h3>

          <div className="space-y-3">
            {trendingSkills?.length ? (
              trendingSkills.map((skill, index) => (
                <div
                  key={skill.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-4 text-white/40">
                      {index + 1}
                    </span>
                    <span className="text-white/80">
                      {skill.name}
                    </span>
                  </div>
                  <span className="text-white/40">
                    {skill.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-white/40">
                No trending skills yet
              </p>
            )}
          </div>
        </div>

        {/* Streak */}
        <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-blue-600/10 p-4">
          <p className="text-sm font-medium text-white">
            🔥 Streak Alert!
          </p>

          <p className="mt-2 text-sm text-white/60">
            {streak > 0
              ? `You're on a ${streak}-day streak. Keep it going!`
              : "Start a streak today by completing a challenge."}
          </p>
        </div>

      </div>
    </aside>
  );
}