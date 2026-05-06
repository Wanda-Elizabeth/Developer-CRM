import { useEffect, useState, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Code2,
  Image,
  Smile,
  Send,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from "lucide-react";

type Post = {
  id: number;
  username: string;
  display_name: string;
  content: string;
  post_type: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
};

type Comment = {
  id: number;
  username: string;
  display_name: string;
  content: string;
  created_at: string;
};

type OnlineData = {
  total: number;
  users: { username: string; display_name: string }[];
};

type Props = {
  apiBase: string;
  token: string | null;
  currentUsername: string;
  searchQuery?: string;
};

const CATEGORIES = [
  { key: "all", label: "All Posts", icon: "🌐" },
  { key: "general", label: "General", icon: "💬" },
  { key: "help", label: "Help & Questions", icon: "🙋" },
  { key: "win", label: "Wins & Celebrations", icon: "🏆" },
  { key: "code-review", label: "Code Review", icon: "👨‍💻" },
];

const TYPE_BADGES: Record<string, string> = {
  general: "bg-blue-500/20 text-blue-300",
  help: "bg-yellow-500/20 text-yellow-300",
  win: "bg-emerald-500/20 text-emerald-300",
  "code-review": "bg-violet-500/20 text-violet-300",
};

const TYPE_LABELS: Record<string, string> = {
  general: "general",
  help: "help",
  win: "wins",
  "code-review": "code-review",
};

const TRENDING_TOPICS = [
  "#react-hooks",
  "#system-design",
  "#typescript",
  "#next-js",
  "#devops",
];

const GUIDELINES = [
  "Be respectful and kind",
  "Share knowledge freely",
  "Ask questions without fear",
  "Celebrate each other's wins",
];

function authHeaders(token: string | null, json = false): HeadersInit {
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);

  if (diffHours < 24) return `${diffHours}h ago`;

  return `${Math.floor(diffHours / 24)}d ago`;
}

function getInitials(name: string) {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-pink-500 to-rose-600",
  "from-yellow-500 to-orange-600",
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function renderContent(content: string) {
  const codeBlockRegex = /```[\s\S]*?```/g;
  const parts = content.split(codeBlockRegex);
  const codeBlocks = content.match(codeBlockRegex) || [];

  return (
    <div className="min-w-0 space-y-3">
      {parts.map((part, i) => (
        <div key={i} className="min-w-0">
          {part && (
            <p className="break-words text-sm leading-relaxed text-white/80">
              {part}
            </p>
          )}

          {codeBlocks[i] && (
            <pre className="mt-2 max-w-full overflow-x-auto rounded-xl border border-white/10 bg-black/50 p-4 text-xs text-emerald-300">
              <code>{codeBlocks[i].replace(/```(\w+)?/g, "").trim()}</code>
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

export function CommunityPage({
  apiBase,
  token,
  currentUsername,
  searchQuery = "",
}: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("general");
  const [posting, setPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(
    new Set()
  );
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentInput, setCommentInput] = useState<Record<number, string>>({});
  const [onlineData, setOnlineData] = useState<OnlineData>({
    total: 0,
    users: [],
  });
  const [localSearch, setLocalSearch] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (searchQuery) setLocalSearch(searchQuery);
  }, [searchQuery]);

  const fetchPosts = async (type = "all") => {
    try {
      setLoading(true);

      const url =
        type === "all"
          ? `${apiBase}/community/`
          : `${apiBase}/community/?type=${encodeURIComponent(type)}`;

      const res = await fetch(url, {
        headers: authHeaders(token),
      });

      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();

      setPosts(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeCategory);
  }, [activeCategory, apiBase, token]);

  useEffect(() => {
    const fetchOnline = async () => {
      try {
        const res = await fetch(`${apiBase}/online-users/`, {
          headers: authHeaders(token),
        });

        if (res.ok) {
          setOnlineData(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch online users", err);
      }
    };

    fetchOnline();

    const interval = window.setInterval(fetchOnline, 60000);

    return () => window.clearInterval(interval);
  }, [apiBase, token]);

  const filteredPosts = posts.filter((post) => {
    if (!localSearch.trim()) return true;

    const q = localSearch.toLowerCase();

    return (
      post.content.toLowerCase().includes(q) ||
      post.display_name.toLowerCase().includes(q) ||
      post.username.toLowerCase().includes(q) ||
      post.post_type.toLowerCase().includes(q)
    );
  });

  const handlePost = async () => {
    const text = content.trim();

    if (!text || posting) return;

    try {
      setPosting(true);

      const res = await fetch(`${apiBase}/community/`, {
        method: "POST",
        headers: authHeaders(token, true),
        body: JSON.stringify({
          content: text,
          post_type: postType,
        }),
      });

      if (!res.ok) throw new Error("Failed to create post");

      const newPost = await res.json();

      setPosts((prev) => [newPost, ...prev]);
      setContent("");
    } catch (err) {
      console.error("Failed to post", err);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const res = await fetch(`${apiBase}/community/${postId}/like/`, {
        method: "POST",
        headers: authHeaders(token),
      });

      if (!res.ok) throw new Error("Failed to like post");

      const data = await res.json();

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes_count: data.likes_count,
                liked_by_me: data.liked,
              }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to like", err);
    }
  };

  const toggleComments = async (postId: number) => {
    const next = new Set(expandedComments);

    if (next.has(postId)) {
      next.delete(postId);
    } else {
      next.add(postId);

      if (!comments[postId]) {
        try {
          const res = await fetch(`${apiBase}/community/${postId}/comments/`, {
            headers: authHeaders(token),
          });

          if (!res.ok) throw new Error("Failed to fetch comments");

          const data = await res.json();

          setComments((prev) => ({
            ...prev,
            [postId]: Array.isArray(data) ? data : data.results || [],
          }));
        } catch (err) {
          console.error("Failed to fetch comments", err);
        }
      }
    }

    setExpandedComments(next);
  };

  const handleComment = async (postId: number) => {
    const text = commentInput[postId]?.trim();

    if (!text) return;

    try {
      const res = await fetch(`${apiBase}/community/${postId}/comments/`, {
        method: "POST",
        headers: authHeaders(token, true),
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) throw new Error("Failed to comment");

      const newComment = await res.json();

      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));

      setCommentInput((prev) => ({ ...prev, [postId]: "" }));

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments_count: p.comments_count + 1 }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to comment", err);
    }
  };

  const insertCodeBlock = () => {
    const code = "```\n// your code here\n```";

    setContent((prev) => prev + (prev ? "\n" : "") + code);
    textareaRef.current?.focus();
  };

  return (
    <div className="w-full min-w-0 space-y-6 overflow-x-hidden">
      <div className="min-w-0">
        <h1 className="mb-1 text-2xl font-bold text-white sm:text-3xl">
          Community Feed
        </h1>

        <p className="text-sm text-white/60 sm:text-base">
          Connect with developers, share wins, and get help
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_14rem]">
        {/* Left Panel - Desktop Only */}
        <div className="hidden space-y-4 lg:block">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                    activeCategory === cat.key
                      ? "bg-violet-500/20 text-violet-300"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="min-w-0 truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <p className="mb-3 text-sm font-semibold text-yellow-400">
              💡 Community Guidelines
            </p>

            <ul className="space-y-2">
              {GUIDELINES.map((g) => (
                <li
                  key={g}
                  className="flex items-start gap-2 text-xs text-white/60"
                >
                  <span className="mt-0.5 text-yellow-400">•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Center Feed */}
        <div className="min-w-0 space-y-4">
          {/* Mobile Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm ${
                  activeCategory === cat.key
                    ? "bg-violet-600 text-white"
                    : "border border-white/10 bg-white/5 text-white/60"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search posts, people, or topics..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-violet-500/40"
            />

            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {localSearch && !loading && (
            <p className="text-sm text-white/40">
              {filteredPosts.length} result
              {filteredPosts.length !== 1 ? "s" : ""} for{" "}
              <span className="font-medium text-violet-400">
                "{localSearch}"
              </span>
            </p>
          )}

          {/* Composer */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <div className="flex gap-3">
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white ${getAvatarColor(
                  currentUsername
                )}`}
              >
                {getInitials(currentUsername)}
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share an update, ask a question, or celebrate a win..."
                  rows={3}
                  className="min-h-[90px] w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-violet-500/50"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={insertCodeBlock}
                      className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                      title="Insert code block"
                    >
                      <Code2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Image className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Smile className="h-4 w-4" />
                    </button>

                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value)}
                      className="min-w-0 max-w-[140px] rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 outline-none sm:max-w-none"
                    >
                      <option value="general">General</option>
                      <option value="help">Help & Questions</option>
                      <option value="win">Win 🏆</option>
                      <option value="code-review">Code Review</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handlePost}
                    disabled={!content.trim() || posting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                  >
                    <Send className="h-4 w-4" />
                    {posting ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
                >
                  <div className="flex gap-3">
                    <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-white/10" />

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="h-4 w-1/3 animate-pulse rounded bg-white/10 sm:w-1/4" />
                      <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                      <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filteredPosts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center sm:p-10">
              <div className="mb-3 text-3xl">{localSearch ? "🔍" : "💬"}</div>

              <h2 className="text-lg font-semibold text-white">
                {localSearch
                  ? `No posts match "${localSearch}"`
                  : "No posts yet"}
              </h2>

              <p className="mt-2 text-sm text-white/60">
                {localSearch
                  ? "Try a different search term"
                  : "Be the first to share something with the community!"}
              </p>
            </div>
          )}

          {/* Posts */}
          {!loading &&
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:border-white/20 sm:p-5"
              >
                <div className="mb-4 flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white ${getAvatarColor(
                      post.username
                    )}`}
                  >
                    {getInitials(post.display_name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="min-w-0 break-words font-medium text-white">
                        {post.display_name}
                      </span>

                      <span className="text-xs text-white/40">
                        · {formatTime(post.created_at)}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          TYPE_BADGES[post.post_type] ||
                          "bg-white/10 text-white/60"
                        }`}
                      >
                        {TYPE_LABELS[post.post_type] || post.post_type}
                      </span>
                    </div>

                    <p className="break-words text-xs text-white/40">
                      @{post.username}
                    </p>
                  </div>
                </div>

                <div className="mb-4 min-w-0">
                  {renderContent(post.content)}
                </div>

                <div className="flex flex-wrap items-center gap-5 border-t border-white/10 pt-4 sm:gap-6">
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      post.liked_by_me
                        ? "text-red-400"
                        : "text-white/50 hover:text-red-400"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        post.liked_by_me ? "fill-red-400" : ""
                      }`}
                    />
                    {post.likes_count}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {post.comments_count}
                    {expandedComments.has(post.id) ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>

                {expandedComments.has(post.id) && (
                  <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                    {(comments[post.id] || []).map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${getAvatarColor(
                            comment.username
                          )}`}
                        >
                          {getInitials(comment.display_name)}
                        </div>

                        <div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="break-words text-sm font-medium text-white">
                              {comment.display_name}
                            </span>

                            <span className="text-xs text-white/40">
                              {formatTime(comment.created_at)}
                            </span>
                          </div>

                          <p className="break-words text-sm text-white/70">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-3">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${getAvatarColor(
                          currentUsername
                        )}`}
                      >
                        {getInitials(currentUsername)}
                      </div>

                      <div className="flex min-w-0 flex-1 gap-2">
                        <input
                          value={commentInput[post.id] || ""}
                          onChange={(e) =>
                            setCommentInput((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleComment(post.id);
                            }
                          }}
                          placeholder="Write a comment..."
                          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-violet-500/50"
                        />

                        <button
                          type="button"
                          onClick={() => handleComment(post.id)}
                          disabled={!commentInput[post.id]?.trim()}
                          className="rounded-xl bg-violet-600 px-3 py-2 text-white transition-colors hover:bg-violet-500 disabled:opacity-40"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Right Panel - Desktop Only */}
        <div className="hidden space-y-4 xl:block">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />

              <p className="text-sm font-semibold text-white">
                Online Now ({onlineData.total})
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {onlineData.users.map((user) => (
                <div
                  key={user.username}
                  title={user.display_name}
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${getAvatarColor(
                    user.username
                  )}`}
                >
                  {getInitials(user.display_name)}
                </div>
              ))}

              {onlineData.total > onlineData.users.length && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-white/40">
                  +{onlineData.total - onlineData.users.length}
                </div>
              )}

              {onlineData.total === 0 && (
                <p className="text-xs text-white/40">No one else online</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-3 text-sm font-semibold text-white">
              🔥 Trending Topics
            </p>

            <div className="space-y-2">
              {TRENDING_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setContent((prev) => prev + " " + topic)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}