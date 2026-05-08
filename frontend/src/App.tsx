import { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import AuthPage from "./AuthPage";
import { clearTokens, getAccessToken, isLoggedIn } from "./auth";
import { DashboardLayout } from "./components/DashboardLayout";
import type { ActiveView } from "./components/Sidebar";
import { DashboardPage } from "./pages/DashboardPage";
import { WeeklyChallengesPage } from "./pages/WeeklyChallengesPage";
import { SubmissionsPage, type UserSubmission } from "./pages/SubmissionsPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { JobsPage } from "./pages/JobsPage";
import { CommunityPage } from "./pages/CommunityPage";
import { LandingPage } from "./pages/LandingPage";
import { ChatPage } from "./pages/ChatPage";
import type { Notification } from "./components/TopNavbar";



export type Submission = {
  id: number;
  github_link: string;
  user_name: string;
  created_at?: string;
  likes?: number;
};

export type Challenge = {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  submissions: Submission[];
};

export type WeeklyActivityItem = {
  day: string;
  date: string;
  count: number;
};

export type RecentActivityItem = {
  id: number;
  type: string;
  title: string;
  time: string | null;
  likes?: number;
  challenge?: string;
};

type DashboardApiData = {
  user: {
    id: number;
    username: string;
    display_name: string;
    email: string;
  };
  stats: {
    total_submissions: number;
    total_likes: number;
    streak: number;
  };
  weekly_activity: WeeklyActivityItem[];
  recent_activity: RecentActivityItem[];
};

export type LeaderboardEntry = {
  rank: number;
  username: string;
  full_name: string;
  points: number;
  submissions: number;
  streak: number;
};

export type TrendingSkill = {
  name: string;
  count: number;
};

export type ProfileData = {
  username: string;
  email: string;
  joined_at: string;
  total_submissions: number;
  total_likes: number;
  streak: number;
  longest_streak: number;
  global_rank: string;
  total_points: number;
  bio?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  skills?: { name: string; level: number }[];
};

const PATH_TO_VIEW: Record<string, ActiveView> = {
  "/dashboard": "dashboard",
  "/challenges": "challenges",
  "/submissions": "submissions",
  "/leaderboard": "leaderboard",
  "/jobs": "jobs",
  "/community": "community",
  "/chat": "chat",
  "/profile": "profile",
};

const VIEW_TO_PATH: Record<ActiveView, string> = {
  dashboard: "/dashboard",
  challenges: "/challenges",
  submissions: "/submissions",
  leaderboard: "/leaderboard",
  jobs: "/jobs",
  community: "/community",
  chat: "/chat",
  profile: "/profile",
};

function App() {
  const [authenticated, setAuthenticated] = useState(isLoggedIn());
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardApiData | null>(
    null
  );
  const [trendingSkills, setTrendingSkills] = useState<TrendingSkill[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] =
    useState<Challenge | null>(null);
  const [viewSubmissions, setViewSubmissions] =
    useState<Challenge | null>(null);
  const [github, setGithub] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatUnread, setChatUnread] = useState(0);
  const [chatToast, setChatToast] = useState<{
    message: string;
    username: string;
  } | null>(null);

  const bgWsRef = useRef<WebSocket | null>(null);
  const bgReconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const chatToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const activeViewRef = useRef<ActiveView>("dashboard");
  const usernameRef = useRef<string>("Developer");

  const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8011/api";

  const navigate = useNavigate();
  const location = useLocation();

  const activeView: ActiveView = PATH_TO_VIEW[location.pathname] ?? "dashboard";

  useEffect(() => {
    activeViewRef.current = activeView;
  }, [activeView]);

  useEffect(() => {
    setSearchQuery("");
  }, [location.pathname]);

  useEffect(() => {
    if (activeView === "chat") {
      setChatUnread(0);
      setChatToast(null);

      if (chatToastTimeoutRef.current) {
        clearTimeout(chatToastTimeoutRef.current);
        chatToastTimeoutRef.current = null;
      }
    }
  }, [activeView]);

  useEffect(() => {
    if (
      authenticated &&
      (location.pathname === "/" ||
        location.pathname === "/login" ||
        location.pathname === "/register")
    ) {
      navigate("/dashboard");
    }

    if (
      !authenticated &&
      location.pathname !== "/" &&
      location.pathname !== "/login" &&
      location.pathname !== "/register"
    ) {
      navigate("/");
    }
  }, [authenticated, location.pathname, navigate]);
  // Replace the hardcoded notifications useEffect with this:
useEffect(() => {
  if (!authenticated) return;

  const fetchNotifications = async () => {
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  fetchNotifications();

  // Refresh notifications every 2 minutes
  const interval = setInterval(fetchNotifications, 120000);
  return () => clearInterval(interval);
}, [authenticated, API_BASE]);


  useEffect(() => {
    if (!authenticated) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setDashboardLoading(true);

        const token = getAccessToken();

        const [
          challengesRes,
          dashboardRes,
          trendingRes,
          leaderboardRes,
          profileRes,
        ] = await Promise.all([
          fetch(`${API_BASE}/challenges/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/dashboard/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/trending-skills/`),
          fetch(`${API_BASE}/leaderboard/`),
          fetch(`${API_BASE}/profile/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!challengesRes.ok) throw new Error("Failed to fetch challenges");
        if (!dashboardRes.ok) throw new Error("Failed to fetch dashboard data");

        const challengesData: Challenge[] = await challengesRes.json();
        const dashboardJson: DashboardApiData = await dashboardRes.json();
        const trendingData: TrendingSkill[] = trendingRes.ok
          ? await trendingRes.json()
          : [];
        const leaderboardJson: LeaderboardEntry[] = leaderboardRes.ok
          ? await leaderboardRes.json()
          : [];
        const profileJson: ProfileData | null = profileRes.ok
          ? await profileRes.json()
          : null;

        setChallenges(challengesData);
        setDashboardData(dashboardJson);
        setTrendingSkills(trendingData);
        setLeaderboard(leaderboardJson);
        setProfileData(profileJson);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setDashboardLoading(false);
      }
    };

    fetchAll();
  }, [authenticated, API_BASE]);

  useEffect(() => {
    if (!authenticated) return;

    let shouldReconnect = true;

    const base =
      import.meta.env.VITE_WS_URL ||
      (window.location.protocol === "https:" ? "wss" : "ws") +
        "://" +
        window.location.hostname +
        ":8011";

    const connectBgWs = () => {
      if (!shouldReconnect) return;

      if (
        bgWsRef.current?.readyState === WebSocket.OPEN ||
        bgWsRef.current?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      const ws = new WebSocket(`${base}/ws/chat/`);
      bgWsRef.current = ws;

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);

          const isIncomingMessage =
            data.type === "message" &&
            data.username !== usernameRef.current &&
            activeViewRef.current !== "chat";

          if (!isIncomingMessage) return;

          setChatUnread((current) => current + 1);
          setChatToast({
            message: data.message,
            username: data.username,
          });

          if (chatToastTimeoutRef.current) {
            clearTimeout(chatToastTimeoutRef.current);
          }

          chatToastTimeoutRef.current = setTimeout(() => {
            setChatToast(null);
            chatToastTimeoutRef.current = null;
          }, 5000);
        } catch {
          // Ignore invalid websocket payloads.
        }
      };

      ws.onclose = () => {
        bgWsRef.current = null;

        if (!shouldReconnect) return;

        bgReconnectTimeoutRef.current = setTimeout(() => {
          connectBgWs();
        }, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectBgWs();

    return () => {
      shouldReconnect = false;

      if (bgReconnectTimeoutRef.current) {
        clearTimeout(bgReconnectTimeoutRef.current);
        bgReconnectTimeoutRef.current = null;
      }

      if (chatToastTimeoutRef.current) {
        clearTimeout(chatToastTimeoutRef.current);
        chatToastTimeoutRef.current = null;
      }

      bgWsRef.current?.close();
      bgWsRef.current = null;
    };
  }, [authenticated]);

  useEffect(() => {
    if (!dashboardData && !challenges.length) return;

    const notifs: Notification[] = [];

    challenges.slice(0, 2).forEach((c, i) => {
      notifs.push({
        id: `challenge-${c.id}`,
        type: "challenge",
        message: `New challenge available: "${c.title}"`,
        time: new Date(Date.now() - i * 3600000).toISOString(),
        read: false,
      });
    });

    if (dashboardData && dashboardData.stats.total_likes > 0) {
      notifs.push({
        id: "likes",
        type: "like",
        message: `Your submissions received ${
          dashboardData.stats.total_likes
        } like${dashboardData.stats.total_likes > 1 ? "s" : ""}`,
        time: new Date(Date.now() - 7200000).toISOString(),
        read: false,
      });
    }

    if (dashboardData && dashboardData.stats.streak > 0) {
      notifs.push({
        id: "streak",
        type: "submission",
        message: `You're on a ${dashboardData.stats.streak}-day streak! Keep it going 🔥`,
        time: new Date(Date.now() - 86400000).toISOString(),
        read: true,
      });
    }

    setNotifications(notifs);
  }, [dashboardData, challenges]);

const handleMarkAllRead = async () => {
  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  try {
    await fetch(`${API_BASE}/notifications/read/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
  } catch (err) {
    console.error(err);
  }
};

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) return;

    const q = query.toLowerCase();

    if (
      q.includes("job") ||
      q.includes("work") ||
      q.includes("hire") ||
      q.includes("remote")
    ) {
      navigate("/jobs");
    } else if (
      q.includes("challenge") ||
      q.includes("code") ||
      q.includes("build") ||
      q.includes("django") ||
      q.includes("react") ||
      q.includes("python") ||
      q.includes("typescript")
    ) {
      navigate("/challenges");
    } else if (
      q.includes("leader") ||
      q.includes("rank") ||
      q.includes("top") ||
      q.includes("points")
    ) {
      navigate("/leaderboard");
    } else if (
      q.includes("community") ||
      q.includes("post") ||
      q.includes("win") ||
      q.includes("help")
    ) {
      navigate("/community");
    } else if (
      q.includes("profile") ||
      q.includes("skill") ||
      q.includes("bio") ||
      q.includes("github")
    ) {
      navigate("/profile");
    } else if (q.includes("chat") || q.includes("message")) {
      navigate("/chat");
    } else if (q.includes("submission")) {
      navigate("/submissions");
    } else {
      navigate("/challenges");
    }
  };

  const username =
    dashboardData?.user.display_name ||
    dashboardData?.user.username ||
    "Developer";

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  const dashboardStats = {
    totalChallenges: challenges.length,
    totalSubmissions: dashboardData?.stats.total_submissions ?? 0,
    totalLikes: dashboardData?.stats.total_likes ?? 0,
    streak: dashboardData?.stats.streak ?? 0,
    username,
  };

  const userSubmissions: UserSubmission[] = useMemo(() => {
    const currentUsername = dashboardData?.user.username?.toLowerCase();

    return challenges.flatMap((challenge) =>
      challenge.submissions
        .filter((s) => {
          if (!currentUsername) return false;
          return s.user_name?.toLowerCase() === currentUsername;
        })
        .map((s) => ({
          ...s,
          challengeTitle: challenge.title,
          difficulty: challenge.difficulty,
        }))
    );
  }, [challenges, dashboardData]);

  const isValidGithubUrl = (url: string) => {
    try {
      const parsed = new URL(url);

      if (
        parsed.hostname !== "github.com" &&
        parsed.hostname !== "www.github.com"
      ) {
        return false;
      }

      return parsed.pathname.split("/").filter(Boolean).length >= 2;
    } catch {
      return false;
    }
  };

  const validateGithub = (value: string) => {
    if (!value.trim()) {
      setError("GitHub link is required");
      return false;
    }

    if (!isValidGithubUrl(value)) {
      setError("Enter a valid GitHub link");
      return false;
    }

    setError("");
    return true;
  };

  const openSubmitModal = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setGithub("");
    setError("");
    setOpen(true);
  };

  const closeSubmitModal = () => {
    setOpen(false);
    setSelectedChallenge(null);
    setGithub("");
    setError("");
    setSubmitting(false);
  };

  const refreshAllData = async () => {
    const token = getAccessToken();

    const [
      challengesRes,
      dashboardRes,
      trendingRes,
      leaderboardRes,
      profileRes,
    ] = await Promise.all([
      fetch(`${API_BASE}/challenges/`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE}/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE}/trending-skills/`),
      fetch(`${API_BASE}/leaderboard/`),
      fetch(`${API_BASE}/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const challengesData: Challenge[] = await challengesRes.json();
    const dashboardJson: DashboardApiData = await dashboardRes.json();
    const trendingData: TrendingSkill[] = trendingRes.ok
      ? await trendingRes.json()
      : [];
    const leaderboardJson: LeaderboardEntry[] = leaderboardRes.ok
      ? await leaderboardRes.json()
      : [];
    const profileJson: ProfileData | null = profileRes.ok
      ? await profileRes.json()
      : null;

    setChallenges(challengesData);
    setDashboardData(dashboardJson);
    setTrendingSkills(trendingData);
    setLeaderboard(leaderboardJson);
    setProfileData(profileJson);

    if (viewSubmissions) {
      const updated = challengesData.find((c) => c.id === viewSubmissions.id);
      if (updated) setViewSubmissions(updated);
    }
  };

  const handleSubmit = async () => {
    if (!selectedChallenge) return;
    if (!validateGithub(github)) return;

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/submit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({
          challenge: selectedChallenge.id,
          github_link: github,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      await refreshAllData();
      closeSubmitModal();
    } catch (err) {
      console.error(err);
      setError("Could not submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (submissionId: number) => {
    try {
      const res = await fetch(`${API_BASE}/submission/${submissionId}/like/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error("Failed to like");

      await refreshAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    clearTokens();
    setAuthenticated(false);
    setChatUnread(0);
    setChatToast(null);
    navigate("/");
  };

  if (!authenticated) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onLogin={() => navigate("/login")}
              onRegister={() => navigate("/register")}
            />
          }
        />

        <Route
          path="/login"
          element={
            <AuthPage
              onAuthSuccess={() => {
                setAuthenticated(true);
                navigate("/dashboard");
              }}
              initialMode="login"
            />
          }
        />

        <Route
          path="/register"
          element={
            <AuthPage
              onAuthSuccess={() => {
                setAuthenticated(true);
                navigate("/dashboard");
              }}
              initialMode="register"
            />
          }
        />

        <Route
          path="*"
          element={
            <LandingPage
              onLogin={() => navigate("/login")}
              onRegister={() => navigate("/register")}
            />
          }
        />
      </Routes>
    );
  }

  const rightPanelData = {
    recommendedChallenges: challenges.slice(0, 3).map((c) => ({
      title: c.title,
      difficulty: c.difficulty,
    })),
    trendingSkills,
    streak: dashboardData?.stats.streak ?? 0,
  };

  const dashboard = (
    <>
  <DashboardLayout
  activeView={activeView}
  onNavigate={(view: ActiveView) => {
    navigate(VIEW_TO_PATH[view]);
  }}
  username={username}
  rightPanelData={rightPanelData}
  notifications={notifications}
  onMarkAllRead={handleMarkAllRead}
  onSearch={handleSearch}
  chatUnread={chatUnread}
  onLogout={handleLogout}
>
        {activeView === "dashboard" && (
          <DashboardPage
            stats={dashboardStats}
            challenges={challenges}
            weeklyActivity={dashboardData?.weekly_activity ?? []}
            recentActivity={dashboardData?.recent_activity ?? []}
            loading={dashboardLoading}
          />
        )}

        {activeView === "challenges" && (
          <WeeklyChallengesPage
            challenges={challenges}
            loading={loading}
            openSubmitModal={openSubmitModal}
            setViewSubmissions={setViewSubmissions}
            searchQuery={searchQuery}
          />
        )}

        {activeView === "submissions" && (
          <SubmissionsPage submissions={userSubmissions} />
        )}

        {activeView === "leaderboard" && (
          <LeaderboardPage
            leaderboard={leaderboard}
            currentUsername={dashboardData?.user.username || username}
            searchQuery={searchQuery}
          />
        )}

        {activeView === "jobs" && (
          <JobsPage
            apiBase={API_BASE}
            token={getAccessToken()}
            userTags={
              profileData?.skills?.length
                ? profileData.skills.map((s) => s.name.toLowerCase())
                : ["react", "typescript", "django", "python"]
            }
            searchQuery={searchQuery}
          />
        )}

        {activeView === "community" && (
          <CommunityPage
            apiBase={API_BASE}
            token={getAccessToken()}
            currentUsername={username}
            searchQuery={searchQuery}
          />
        )}

        {activeView === "chat" && (

          <ChatPage
            currentUsername={username}
             wsBase={import.meta.env.VITE_WS_URL}
            onUnreadChange={() => {
              setChatUnread(0);
            }}
          />
        )}

        {activeView === "profile" && profileData && (
          <ProfilePage
            apiBase={API_BASE}
            token={getAccessToken()}
            stats={{
              username: profileData.username,
              totalSubmissions: profileData.total_submissions,
              totalLikes: profileData.total_likes,
              streak: profileData.streak,
              longestStreak: profileData.longest_streak,
              globalRank: profileData.global_rank,
              email: profileData.email,
              joinedAt: profileData.joined_at,
              totalChallenges: challenges.length,
              achievements: [],
              bio: profileData.bio,
              location: profileData.location,
              github: profileData.github,
              linkedin: profileData.linkedin,
              website: profileData.website,
              skills: profileData.skills || [],
            }}
          />
        )}
      </DashboardLayout>

      {open && selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Submit Solution
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {selectedChallenge.title}
                </p>
              </div>

              <button
                onClick={closeSubmitModal}
                className="text-xl text-zinc-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-zinc-300">
                GitHub link
              </label>

              <input
                value={github}
                onChange={(e) => {
                  setGithub(e.target.value);
                  if (error) validateGithub(e.target.value);
                }}
                onBlur={(e) => validateGithub(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
              />

              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeSubmitModal}
                className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewSubmissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {viewSubmissions.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {viewSubmissions.submissions.length} submissions
                </p>
              </div>

              <button
                onClick={() => setViewSubmissions(null)}
                className="text-2xl text-zinc-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="max-h-[420px] space-y-3 overflow-y-auto">
              {viewSubmissions.submissions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-zinc-400">
                  No submissions yet for this challenge.
                </div>
              ) : (
                viewSubmissions.submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="rounded-xl border border-white/10 bg-zinc-900 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-400">
                          @{submission.user_name}
                        </p>

                        <a
                          href={submission.github_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-violet-400 hover:underline"
                        >
                          View on GitHub
                        </a>
                      </div>

                      <button
                        onClick={() => handleLike(submission.id)}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
                      >
                        ❤️ {submission.likes || 0}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {chatToast && activeView !== "chat" && (
        <div
          onClick={() => {
            navigate("/chat");
            setChatToast(null);
            setChatUnread(0);
          }}
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 cursor-pointer items-center gap-3 rounded-2xl border border-violet-500/30 bg-[#13131e] px-4 py-3 shadow-2xl transition-all hover:border-violet-500/50 hover:bg-[#1a1a2e]"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg">
            <span className="text-sm font-black text-white">#</span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white">
  {chatToast.username} <span className="text-white/50">sent a message in</span>{" "}
  <span className="text-violet-400">#general</span>
</p>

            <p className="max-w-[200px] truncate text-xs text-white/50">
              {chatToast.message}
            </p>
          </div>

          {chatUnread > 0 && (
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-500">
              <span className="text-[10px] font-black text-white">
                {chatUnread > 9 ? "9+" : chatUnread}
              </span>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setChatToast(null);
            }}
            className="ml-1 flex-shrink-0 text-white/30 transition-colors hover:text-white"
            aria-label="Dismiss chat notification"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );

  return (
    <Routes>
      <Route path="/dashboard" element={dashboard} />
      <Route path="/challenges" element={dashboard} />
      <Route path="/submissions" element={dashboard} />
      <Route path="/leaderboard" element={dashboard} />
      <Route path="/jobs" element={dashboard} />
      <Route path="/community" element={dashboard} />
      <Route path="/chat" element={dashboard} />
      <Route path="/profile" element={dashboard} />
      <Route path="*" element={dashboard} />
    </Routes>
  );
}

export default App;