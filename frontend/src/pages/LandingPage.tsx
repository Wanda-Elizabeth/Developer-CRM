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
  Zap,
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
        scrolled ? "bg-[#06060a]/95 backdrop-blur-xl border-b border-white/8" : ""
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-sm flex-shrink-0">
              🏆
            </div>
            <span className="font-black text-base tracking-tight">DevForge</span>
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
              className="text-sm font-bold bg-white text-black px-4 sm:px-5 py-2 rounded-xl hover:bg-white/90 transition-all shadow-lg shadow-white/10"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO — two column */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 pt-16">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-violet-700/12 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-700/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-700/6 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>

        <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-10 xl:gap-20 items-center py-20 sm:py-28">

          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 border border-violet-500/20 bg-violet-500/8 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-7 tracking-wide">
              <Zap className="w-3 h-3" />
              AI-powered challenges every Mon & Thu
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-[-0.04em] leading-[0.93] mb-5">
              Where developers
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                grow their careers
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/40 leading-relaxed max-w-md mb-8 font-light">
              Coding challenges, a live job board, and a developer community.
              Stop switching between five apps — it's all here.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={onRegister}
                className="group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold px-6 py-3.5 rounded-xl text-sm hover:shadow-xl hover:shadow-violet-500/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                Start for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={onLogin}
                className="inline-flex items-center justify-center gap-2 border border-white/10 bg-white/4 text-white/60 font-medium px-6 py-3.5 rounded-xl text-sm hover:bg-white/8 hover:text-white transition-all"
              >
                Sign in to your account
              </button>
            </div>

            <div className="flex flex-wrap gap-5">
              {[
                "Free to join",
                "No credit card",
                "Real remote jobs",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-white/35">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — mockup */}
          <div className="relative hidden lg:block">
            <div className="absolute -inset-6 bg-gradient-to-br from-violet-600/15 to-blue-600/10 rounded-3xl blur-3xl" />

            <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/60 bg-[#0d0d12]">
              {/* Browser bar */}
              <div className="bg-[#111118] border-b border-white/6 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex-1 max-w-[200px] bg-white/6 border border-white/6 rounded-md h-5 flex items-center px-2.5">
                  <span className="text-white/20 text-[10px]">developer-crm.onrender.com</span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: "47", l: "Submissions", c: "text-violet-400", bg: "bg-violet-500/8" },
                    { v: "128", l: "Likes Received", c: "text-blue-400", bg: "bg-blue-500/8" },
                    { v: "7 days 🔥", l: "Current Streak", c: "text-orange-400", bg: "bg-orange-500/8" },
                    { v: "#12", l: "Global Rank", c: "text-emerald-400", bg: "bg-emerald-500/8" },
                  ].map((s) => (
                    <div key={s.l} className={`${s.bg} border border-white/6 rounded-xl p-3`}>
                      <p className={`text-base font-black ${s.c}`}>{s.v}</p>
                      <p className="text-[11px] text-white/30 mt-0.5">{s.l}</p>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="bg-white/3 border border-white/6 rounded-xl p-3">
                  <p className="text-[11px] text-white/40 mb-2 font-semibold uppercase tracking-wide">Weekly Activity</p>
                  <div className="flex items-end gap-1 h-8">
                    {[35, 60, 25, 90, 45, 70, 55].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-violet-600 to-blue-400/70"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1.5">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <span key={i} className="flex-1 text-center text-[10px] text-white/20">{d}</span>
                    ))}
                  </div>
                </div>

                {/* Job + Challenge */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/3 border border-white/6 rounded-xl p-3">
                    <p className="text-[10px] text-white/35 mb-1 font-semibold uppercase tracking-wide">Top Job Match</p>
                    <p className="text-xs font-bold text-white leading-snug mb-2">Senior Full Stack Engineer</p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1 rounded-full bg-white/8">
                        <div className="h-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: "92%" }} />
                      </div>
                      <span className="text-[10px] text-emerald-400 font-black">92%</span>
                    </div>
                  </div>
                  <div className="bg-white/3 border border-white/6 rounded-xl p-3">
                    <p className="text-[10px] text-white/35 mb-1 font-semibold uppercase tracking-wide">This Week</p>
                    <p className="text-xs font-bold text-white leading-snug mb-2">Build REST API with Django</p>
                    <span className="text-[10px] text-yellow-400 bg-yellow-500/12 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                      Medium
                    </span>
                  </div>
                </div>

                {/* Community post */}
                <div className="bg-white/3 border border-white/6 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                      S
                    </div>
                    <span className="text-xs text-white/70 font-semibold">Sarah Chen</span>
                    <span className="ml-auto text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                      win 🏆
                    </span>
                  </div>
                  <p className="text-[11px] text-white/45 leading-relaxed">
                    Just got accepted at Vercel! The challenges here really helped me prepare for the interview...
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-white/25">❤️ 47</span>
                    <span className="text-[10px] text-white/25">💬 12</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -bottom-5 -left-5 bg-[#13131a] border border-white/10 rounded-2xl px-4 py-2.5 shadow-2xl shadow-black/40">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">Live job board</span>
              </div>
              <p className="text-[10px] text-white/35 mt-0.5">Updated daily · 2+ sources</p>
            </div>

            <div className="absolute -top-5 -right-5 bg-[#13131a] border border-white/10 rounded-2xl px-4 py-2.5 shadow-2xl shadow-black/40">
              <div className="flex items-center gap-2">
                <span className="text-base">🔥</span>
                <div>
                  <p className="text-xs font-bold text-white">7-day streak</p>
                  <p className="text-[10px] text-white/35">Keep it going!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/20 lg:hidden">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <div className="border-y border-white/5 bg-white/2 py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-8 sm:gap-16">
          {[
            { number: "2x", label: "Challenges per week" },
            { number: "Daily", label: "Job board updates" },
            { number: "Global", label: "Developer community" },
            { number: "Free", label: "Core features" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-lg sm:text-xl font-black text-white">{item.number}</p>
              <p className="text-xs text-white/30 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MY STORY */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-start">
          <div>
            <p className="text-xs font-black tracking-[0.2em] uppercase text-violet-400 mb-5 opacity-80">
              The story behind DevForge
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-7">
              Built from a real problem,
              <br className="hidden sm:block" />
              not a hackathon
            </h2>
            <div className="space-y-4 text-white/45 leading-relaxed text-sm sm:text-base">
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
              <div className="border-l-2 border-violet-500 pl-4 py-1">
                <p className="text-white/80 font-semibold">
                  DevForge is that place. I'm building it in public,
                  shipping feature by feature, and using it myself every day.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                emoji: "😤",
                title: "Job posts you keep missing",
                desc: "WhatsApp groups move too fast. DevForge's job board is always there, updated daily, ranked by your skills.",
              },
              {
                emoji: "⏰",
                title: "No time after work",
                desc: "Bite-sized weekly challenges. Build something real, push to GitHub, get community feedback — in your own time.",
              },
              {
                emoji: "🎯",
                title: "Jobs matched to your skills",
                desc: "The job board ranks roles by how well they match your actual tech stack — not generic keyword search.",
              },
              {
                emoji: "📊",
                title: "Nothing proving your consistency",
                desc: "Streaks, points, and a leaderboard give you something concrete to show beyond a CV.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-3 sm:gap-4 p-4 bg-white/3 border border-white/6 rounded-2xl hover:border-violet-500/20 hover:bg-white/4 transition-all group"
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{item.emoji}</span>
                <div>
                  <p className="font-bold text-white/90 mb-1 text-sm">{item.title}</p>
                  <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />
      </div>

      {/* FEATURES */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs font-black tracking-[0.2em] uppercase text-violet-400 mb-3 opacity-80">
            What's inside
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            Five things. Done well.
          </h2>
          <p className="text-white/35 text-sm mt-3 max-w-md mx-auto">
            No bloat. No noise. Just the features developers actually need.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              icon: <Code2 className="w-5 h-5" />,
              accent: "violet",
              title: "Weekly Challenges",
              desc: "AI-generated coding challenges twice a week. Submit your GitHub link, earn points, get feedback.",
              tag: "2x per week",
            },
            {
              icon: <Briefcase className="w-5 h-5" />,
              accent: "blue",
              title: "Smart Job Board",
              desc: "Real remote jobs updated daily. Ranked by how well they match your skills — not generic search.",
              tag: "Updated daily",
            },
            {
              icon: <MessageSquare className="w-5 h-5" />,
              accent: "emerald",
              title: "Community Feed",
              desc: "Share wins, ask questions, post code for review. Focused categories. No LinkedIn noise.",
              tag: "Always active",
            },
            {
              icon: <Trophy className="w-5 h-5" />,
              accent: "yellow",
              title: "Leaderboard",
              desc: "Points for submissions and likes. A global rank you can actually improve by showing up.",
              tag: "Global ranking",
            },
            {
              icon: <Flame className="w-5 h-5" />,
              accent: "orange",
              title: "Streak Tracking",
              desc: "A streak that grows every time you complete a challenge. Consistency made visible.",
              tag: "Daily habit",
            },
            {
              icon: <CheckCircle className="w-5 h-5" />,
              accent: "pink",
              title: "Free to start",
              desc: "Core features are free. No credit card. No trial period. 30 seconds to sign up.",
              tag: "Always free",
            },
          ].map((f) => {
            const styles: Record<string, { icon: string; tag: string; border: string }> = {
              violet: { icon: "text-violet-400 bg-violet-500/10 border-violet-500/15", tag: "text-violet-400 bg-violet-500/8", border: "hover:border-violet-500/25" },
              blue: { icon: "text-blue-400 bg-blue-500/10 border-blue-500/15", tag: "text-blue-400 bg-blue-500/8", border: "hover:border-blue-500/25" },
              emerald: { icon: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15", tag: "text-emerald-400 bg-emerald-500/8", border: "hover:border-emerald-500/25" },
              yellow: { icon: "text-yellow-400 bg-yellow-500/10 border-yellow-500/15", tag: "text-yellow-400 bg-yellow-500/8", border: "hover:border-yellow-500/25" },
              orange: { icon: "text-orange-400 bg-orange-500/10 border-orange-500/15", tag: "text-orange-400 bg-orange-500/8", border: "hover:border-orange-500/25" },
              pink: { icon: "text-pink-400 bg-pink-500/10 border-pink-500/15", tag: "text-pink-400 bg-pink-500/8", border: "hover:border-pink-500/25" },
            };
            const s = styles[f.accent];
            return (
              <div
                key={f.title}
                className={`p-5 sm:p-6 bg-white/2 border border-white/6 rounded-2xl ${s.border} hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${s.icon}`}>
                    {f.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${s.tag}`}>
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-black text-white mb-2 text-sm sm:text-base tracking-tight">{f.title}</h3>
                <p className="text-xs text-white/38 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* DIVIDER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />
      </div>

      {/* WHO IS IT FOR */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-white/3 to-white/1 border border-white/6 rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14">
          <div className="mb-8 sm:mb-12">
            <p className="text-xs font-black tracking-[0.2em] uppercase text-violet-400 mb-3 opacity-80">
              Who is it for
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
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
                desc: "Stay sharp between projects. Find remote opportunities that match your stack.",
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
              <div key={item.role} className="group">
                <div className="text-2xl sm:text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                  {item.emoji}
                </div>
                <p className="font-black text-white/90 mb-1.5 text-sm sm:text-base">{item.role}</p>
                <p className="text-xs sm:text-sm text-white/38 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 sm:px-6 pb-20 sm:pb-28 max-w-4xl mx-auto text-center">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-blue-600/12 to-cyan-600/8" />
          <div className="absolute inset-0 border border-violet-500/15 rounded-2xl sm:rounded-3xl" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-violet-600/20 rounded-full blur-3xl" />

          <div className="relative px-6 sm:px-12 py-12 sm:py-16">
            <div className="text-4xl mb-5">🚀</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
              Start building today.
              <br />
              <span className="text-white/25">It's completely free.</span>
            </h2>
            <p className="text-white/40 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
              No credit card. No trial period. Sign up in 30 seconds and start building.
            </p>
            <button
              onClick={onRegister}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-black font-black px-8 sm:px-12 py-4 rounded-2xl text-base hover:bg-white/92 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-white/10 transition-all duration-200"
            >
              Create free account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </button>
            <p className="mt-5 text-xs text-white/25">
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
      <footer className="border-t border-white/5 px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs flex-shrink-0">
              🏆
            </div>
            <span className="font-black text-sm">DevForge</span>
          </div>
          <p className="text-xs text-white/20 text-center">
            Built by a developer in Nairobi, for developers everywhere.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/25">
            <button onClick={onRegister} className="hover:text-white transition-colors">
              Sign up
            </button>
            <span className="text-white/10">·</span>
            <button onClick={onLogin} className="hover:text-white transition-colors">
              Sign in
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}