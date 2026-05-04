import { useEffect, useState } from "react";
import {
  ArrowRight,
  Code2,
  Briefcase,
  MessageSquare,
  Trophy,
  Flame,
  CheckCircle,
  ChevronDown,
} from "lucide-react";

type Props = {
  onLogin: () => void;
  onRegister: () => void;
};

export function LandingPage({ onLogin, onRegister }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#06060a] text-white overflow-x-hidden">

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-[#06060a]/90 backdrop-blur-xl border-b border-white/10" : ""
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-sm flex-shrink-0">
              🏆
            </div>
            <span className="font-bold text-base tracking-tight">DevBuild</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onLogin}
              className="text-sm text-white/50 hover:text-white transition-colors px-3 sm:px-4 py-2 rounded-lg hover:bg-white/5"
            >
              Sign in
            </button>
            <button
              onClick={onRegister}
              className="text-sm font-semibold bg-white text-black px-4 sm:px-5 py-2 rounded-lg hover:bg-white/90 transition-all"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center">
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-violet-600/8 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-blue-600/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-emerald-600/6 rounded-full blur-[80px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] sm:bg-[size:80px_80px]" />
        </div>

        <div className="relative max-w-3xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 border border-violet-500/25 bg-violet-500/10 text-violet-300 text-xs font-medium px-3 sm:px-4 py-2 rounded-full mb-6 sm:mb-8 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse flex-shrink-0" />
            <span>New challenges every Monday & Thursday</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.95] mb-5 sm:mb-6">
            Where developers
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              grow their careers
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/40 leading-relaxed max-w-xl mx-auto mb-8 sm:mb-10 font-light px-2">
            Coding challenges. Remote job board. Developer community.
            Everything you need to level up — in one focused platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onRegister}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold px-7 py-4 rounded-2xl text-base hover:shadow-2xl hover:shadow-violet-500/25 hover:-translate-y-0.5 transition-all duration-200"
            >
              Start for free — no card needed
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </button>
          </div>

          <p className="mt-4 text-sm text-white/25">
            Already have an account?{" "}
            <button
              onClick={onLogin}
              className="text-white/50 hover:text-white underline underline-offset-2 transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="px-4 sm:px-6 pb-20 sm:pb-32 max-w-5xl mx-auto">
        <div className="relative">
          <div className="absolute -inset-4 bg-violet-600/10 rounded-3xl blur-3xl" />
          <div className="relative rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Browser chrome */}
            <div className="bg-[#111117] border-b border-white/8 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/50" />
              </div>
              <div className="flex-1 max-w-xs bg-white/5 rounded-md h-4 sm:h-5 ml-1 sm:ml-2" />
            </div>

            {/* App preview */}
            <div className="bg-[#0a0a0f] p-3 sm:p-6">
              <div className="flex gap-3 sm:gap-4">
                {/* Sidebar — hidden on mobile */}
                <div className="hidden sm:block w-36 md:w-44 space-y-2 flex-shrink-0">
                  {["Dashboard", "Challenges", "Job Board", "Community", "Profile"].map((item, i) => (
                    <div
                      key={item}
                      className={`h-8 sm:h-9 rounded-lg flex items-center px-3 text-xs font-medium ${
                        i === 0
                          ? "bg-violet-500/20 text-violet-300 border border-violet-500/20"
                          : "text-white/30"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                  {/* Stats grid — 2 cols on mobile, 4 on larger */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {[
                      { v: "47", l: "Submissions", c: "text-violet-400" },
                      { v: "128", l: "Likes", c: "text-blue-400" },
                      { v: "7d", l: "Streak", c: "text-orange-400" },
                      { v: "#12", l: "Global Rank", c: "text-emerald-400" },
                    ].map((s) => (
                      <div key={s.l} className="bg-white/4 border border-white/8 rounded-xl p-2.5 sm:p-3">
                        <p className={`text-lg sm:text-xl font-bold ${s.c}`}>{s.v}</p>
                        <p className="text-xs text-white/30 mt-0.5">{s.l}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className="bg-white/4 border border-white/8 rounded-xl p-3 sm:p-4">
                    <p className="text-xs text-white/40 mb-2 sm:mb-3 font-medium">Weekly Activity</p>
                    <div className="flex items-end gap-1 sm:gap-1.5 h-10 sm:h-12">
                      {[40, 65, 30, 85, 50, 75, 60].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-violet-600/80 to-blue-500/60"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Cards — 1 col on mobile, 2 on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-white/4 border border-white/8 rounded-xl p-3 sm:p-4">
                      <p className="text-xs text-white/40 mb-1.5 sm:mb-2 font-medium">Latest Challenge</p>
                      <p className="text-xs sm:text-sm font-semibold text-white">Build a REST API with Django</p>
                      <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full mt-1.5 sm:mt-2 inline-block">
                        Medium
                      </span>
                    </div>
                    <div className="bg-white/4 border border-white/8 rounded-xl p-3 sm:p-4">
                      <p className="text-xs text-white/40 mb-1.5 sm:mb-2 font-medium">Top Job Match</p>
                      <p className="text-xs sm:text-sm font-semibold text-white">Senior Full Stack Engineer</p>
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1.5 sm:mt-2 inline-block">
                        92% match
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MY STORY */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 sm:gap-16 items-start">
          <div>
            <p className="text-xs font-bold tracking-[0.15em] uppercase text-violet-400 mb-4 sm:mb-5 font-mono">
              The story behind DevBuild
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight mb-6 sm:mb-8">
              Built from a real problem,
              <br />
              not a hackathon
            </h2>
            <div className="space-y-4 sm:space-y-5 text-white/50 leading-relaxed text-sm sm:text-base">
              <p>
                I'm a developer in Nairobi. Full-time job, long commute,
                trying to grow on the side. The tools that were supposed to
                help me were scattered, noisy, or just not built for my reality.
              </p>
              <p>
                Job posts would fly past in WhatsApp groups while I was in
                meetings. Networking events happened on weeknights I couldn't
                attend. LeetCode felt disconnected from real work.
              </p>
              <p>
                I wanted one place to practice, find work, and connect with
                other developers. Not five apps. One.
              </p>
              <p className="text-white/80 font-semibold border-l-2 border-violet-500 pl-4">
                DevBuild is that place. I'm building it in public,
                shipping feature by feature, and using it myself every day.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-0 md:pt-2">
            {[
              {
                emoji: "😤",
                title: "Job posts you keep missing",
                desc: "WhatsApp groups move too fast. DevBuild's job board is always there, updated daily, ranked by your skills.",
              },
              {
                emoji: "⏰",
                title: "No time after work",
                desc: "Bite-sized weekly challenges. Build something real, push to GitHub, get community feedback — in your own time.",
              },
              {
                emoji: "🎯",
                title: "Jobs matched to your skills",
                desc: "The job board doesn't just show you everything. It ranks roles by how well they match your actual tech stack.",
              },
              {
                emoji: "📊",
                title: "Nothing proving your consistency",
                desc: "Streaks, points, and a leaderboard give you something concrete to show — beyond a CV that looks like everyone else's.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-3 sm:gap-4 p-4 sm:p-5 bg-white/3 border border-white/6 rounded-2xl hover:border-violet-500/25 hover:bg-white/5 transition-all"
              >
                <span className="text-xl sm:text-2xl flex-shrink-0 mt-0.5">{item.emoji}</span>
                <div>
                  <p className="font-bold text-white/90 mb-1 text-sm">{item.title}</p>
                  <p className="text-xs sm:text-sm text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </div>

      {/* FEATURES */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-violet-400 mb-3 sm:mb-4 font-mono">
            What's inside
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
            Five things. Done well.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[
            {
              icon: <Code2 className="w-5 h-5" />,
              accent: "violet",
              title: "Weekly Challenges",
              desc: "AI-generated coding challenges twice a week. Submit your GitHub link, earn points, get community feedback.",
            },
            {
              icon: <Briefcase className="w-5 h-5" />,
              accent: "blue",
              title: "Smart Job Board",
              desc: "Real remote jobs, updated daily. Ranked based on your skills and submission history.",
            },
            {
              icon: <MessageSquare className="w-5 h-5" />,
              accent: "emerald",
              title: "Community Feed",
              desc: "Share wins, ask questions, post code for review. Categories keep it focused. No LinkedIn noise.",
            },
            {
              icon: <Trophy className="w-5 h-5" />,
              accent: "yellow",
              title: "Leaderboard",
              desc: "Points for submissions and likes. A global rank you can actually improve by showing up.",
            },
            {
              icon: <Flame className="w-5 h-5" />,
              accent: "orange",
              title: "Streak Tracking",
              desc: "A streak that grows every time you complete a challenge. Simple accountability.",
            },
            {
              icon: <CheckCircle className="w-5 h-5" />,
              accent: "pink",
              title: "Free to start",
              desc: "Core features are free. No credit card. No trial. Sign up and start building in 30 seconds.",
            },
          ].map((f) => {
            const colors: Record<string, string> = {
              violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
              blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
              emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
              yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
              orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
              pink: "text-pink-400 bg-pink-500/10 border-pink-500/20",
            };
            return (
              <div
                key={f.title}
                className="p-5 sm:p-6 bg-white/3 border border-white/6 rounded-2xl hover:border-white/12 hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 sm:mb-5 ${colors[f.accent]}`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-white mb-2 tracking-tight text-sm sm:text-base">{f.title}</h3>
                <p className="text-xs sm:text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* DIVIDER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </div>

      {/* WHO IS IT FOR */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 max-w-6xl mx-auto">
        <div className="bg-white/2 border border-white/6 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-14">
          <div className="mb-8 sm:mb-12">
            <p className="text-xs font-bold tracking-[0.15em] uppercase text-violet-400 mb-3 font-mono">
              Who is it for
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              If you write code, this is for you
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                emoji: "👩‍💻",
                role: "Junior developers",
                desc: "Build a portfolio of real challenge submissions. Proof of skills beyond a resume.",
              },
              {
                emoji: "🧑‍🔧",
                role: "Mid-level engineers",
                desc: "Stay sharp. Find remote opportunities that actually match your stack.",
              },
              {
                emoji: "🔍",
                role: "Active job seekers",
                desc: "Leaderboard presence shows consistent effort. That stands out to recruiters.",
              },
              {
                emoji: "🌍",
                role: "Developers worldwide",
                desc: "Remote work has no borders. Built for developers everywhere — not just one market.",
              },
            ].map((item) => (
              <div key={item.role}>
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{item.emoji}</div>
                <p className="font-bold text-white/90 mb-1.5 sm:mb-2 text-sm sm:text-base">{item.role}</p>
                <p className="text-xs sm:text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 sm:px-6 pb-20 sm:pb-32 max-w-4xl mx-auto text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 to-transparent rounded-3xl blur-3xl" />
          <div className="relative py-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 sm:mb-5">
              Start building today.
              <br />
              <span className="text-white/30">It's completely free.</span>
            </h2>
            <p className="text-white/40 text-base sm:text-lg mb-8 sm:mb-10 max-w-md mx-auto">
              No credit card. No trial period. Just sign up and start.
            </p>
            <button
              onClick={onRegister}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-black font-black px-8 sm:px-10 py-4 rounded-2xl text-base hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-200"
            >
              Create free account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </button>
            <p className="mt-4 sm:mt-5 text-sm text-white/25">
              Already have an account?{" "}
              <button
                onClick={onLogin}
                className="text-white/40 hover:text-white underline underline-offset-2 transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/6 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs flex-shrink-0">
              🏆
            </div>
            <span className="font-bold text-sm">DevBuild</span>
          </div>
          <p className="text-xs text-white/25 text-center">
            Built by a developer, for developers everywhere.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/25">
            <button onClick={onRegister} className="hover:text-white transition-colors">
              Sign up
            </button>
            <span>·</span>
            <button onClick={onLogin} className="hover:text-white transition-colors">
              Sign in
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}