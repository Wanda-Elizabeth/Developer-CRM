const recommendedChallenges = [
  { title: "GraphQL API Design", difficulty: "Medium" },
  { title: "React Performance", difficulty: "Hard" },
  { title: "Database Indexing", difficulty: "Medium" },
];

const trendingSkills = [
  { name: "TypeScript", count: 1240 },
  { name: "React Hooks", count: 980 },
  { name: "System Design", count: 856 },
  { name: "GraphQL", count: 732 },
];

export function RightPanel() {
  return (
    <aside className="hidden w-[260px] border-l border-white/10 bg-black/20 p-4 xl:block">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium text-white/80">
            ⚡ Recommended Challenges
          </h3>

          <div className="space-y-3">
            {recommendedChallenges.map((challenge) => (
              <div
                key={challenge.title}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm text-white">{challenge.title}</p>
                <p className="mt-2 text-xs text-violet-400">{challenge.difficulty}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-white/80">
            📈 Trending Skills
          </h3>

          <div className="space-y-3">
            {trendingSkills.map((skill, index) => (
              <div key={skill.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-4 text-white/40">{index + 1}</span>
                  <span className="text-white/80">{skill.name}</span>
                </div>
                <span className="text-white/40">{skill.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-blue-600/10 p-4">
          <p className="text-sm font-medium text-white">🔥 Streak Alert!</p>
          <p className="mt-2 text-sm text-white/60">
            You're on a 7-day streak. Complete one more challenge to reach your goal.
          </p>
        </div>
      </div>
    </aside>
  );
}