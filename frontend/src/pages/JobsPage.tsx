import { useEffect, useState } from "react";
import {
  ExternalLink,
  Search,
  Bookmark,
  MapPin,
  Clock,
  Briefcase,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  tags: string[];
  date: string;
  source: string;
};

type Props = {
  apiBase: string;
  token: string | null;
  userTags?: string[]; // skills from profile
};

function formatDate(dateStr: string) {
  if (!dateStr) return "Recently";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return "1 week ago";
  } catch {
    return "Recently";
  }
}

function getCompanyInitial(company: string) {
  return company?.charAt(0).toUpperCase() || "?";
}

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-pink-500 to-rose-600",
  "from-yellow-500 to-orange-600",
];

function getAvatarColor(company: string) {
  const index = (company?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

const JOB_TYPES = ["All Types", "Full-time", "Part-time", "Contract", "Remote"];

const EXPERIENCE_LEVELS = ["All Levels", "Entry", "Mid", "Senior", "Lead"];

const EXPERIENCE_KEYWORDS: Record<string, string[]> = {
  Entry: ["junior", "entry", "graduate", "intern", "trainee", "associate"],
  Mid: ["mid", "intermediate", "developer", "engineer", "2+", "3+"],
  Senior: ["senior", "sr.", "sr ", "lead", "principal", "5+", "6+", "7+"],
  Lead: ["lead", "head", "principal", "staff", "architect", "manager"],
};

function computeMatchScore(job: Job, userSkills: string[]): number {
  if (!userSkills.length) return 0;
  const jobText = [
    job.title,
    ...(job.tags || []),
  ]
    .join(" ")
    .toLowerCase();

  const matched = userSkills.filter((skill) =>
    jobText.includes(skill.toLowerCase())
  );
  return Math.round((matched.length / userSkills.length) * 100);
}

const JOBS_PER_PAGE = 3;

export function JobsPage({ apiBase, token, userTags = [] }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("All Types");
  const [experienceLevel, setExperienceLevel] = useState("All Levels");
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Default skills if no profile skills yet
  const userSkills =
    userTags.length > 0
      ? userTags
      : ["react", "typescript", "django", "python", "javascript"];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/jobs/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(data);
      } catch {
        setError("Could not load jobs. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [apiBase, token]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, jobType, experienceLevel]);

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = jobs.filter((job) => {
    // Search filter
    const matchesSearch =
      !search ||
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.company?.toLowerCase().includes(search.toLowerCase()) ||
      job.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    // Job type filter
    const matchesType =
      jobType === "All Types" ||
      (() => {
        const text = `${job.title} ${job.location} ${job.tags?.join(" ")}`.toLowerCase();
        if (jobType === "Remote") return text.includes("remote");
        if (jobType === "Full-time") return text.includes("full") || text.includes("fulltime");
        if (jobType === "Part-time") return text.includes("part");
        if (jobType === "Contract") return text.includes("contract") || text.includes("freelance");
        return true;
      })();

    // Experience level filter
    const matchesLevel =
      experienceLevel === "All Levels" ||
      (() => {
        const text = `${job.title} ${job.tags?.join(" ")}`.toLowerCase();
        const keywords = EXPERIENCE_KEYWORDS[experienceLevel] || [];
        return keywords.some((kw) => text.includes(kw));
      })();

    return matchesSearch && matchesType && matchesLevel;
  });

  // Add match score and sort by it
  const scoredJobs = filtered
    .map((job) => ({
      ...job,
      matchScore: computeMatchScore(job, userSkills),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  // Pagination
  const totalPages = Math.ceil(scoredJobs.length / JOBS_PER_PAGE);
  const paginated = scoredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  // Overall profile match score
  const avgMatchScore =
    scoredJobs.length > 0
      ? Math.round(
          scoredJobs.reduce((acc, j) => acc + j.matchScore, 0) /
            scoredJobs.length
        )
      : 0;

  const FilterPanel = () => (
    <div className="space-y-4">
      {/* Job Type */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Job Type</h3>
        <div className="space-y-3">
          {JOB_TYPES.map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-3"
              onClick={() => setJobType(type)}
            >
              <div
                className={`h-4 w-4 flex-shrink-0 rounded-full border-2 transition-all ${
                  jobType === type
                    ? "border-violet-500 bg-violet-500"
                    : "border-white/30"
                }`}
              />
              <span
                className={`text-sm ${
                  jobType === type ? "text-white" : "text-white/60"
                }`}
              >
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">
          Experience Level
        </h3>
        <div className="space-y-3">
          {EXPERIENCE_LEVELS.map((level) => (
            <label
              key={level}
              className="flex cursor-pointer items-center gap-3"
              onClick={() => setExperienceLevel(level)}
            >
              <div
                className={`h-4 w-4 flex-shrink-0 rounded-full border-2 transition-all ${
                  experienceLevel === level
                    ? "border-violet-500 bg-violet-500"
                    : "border-white/30"
                }`}
              />
              <span
                className={`text-sm ${
                  experienceLevel === level ? "text-white" : "text-white/60"
                }`}
              >
                {level}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Match Score */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="mb-2 text-sm font-semibold text-white">Match Score</h3>
        <p className="mb-4 text-xs text-white/50">
          Jobs are ranked by how well they match your skills:{" "}
          <span className="text-violet-400">
            {userSkills.join(", ")}
          </span>
        </p>
        <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
            style={{ width: `${avgMatchScore}%` }}
          />
        </div>
        <p className="text-xs text-white/50">
          {avgMatchScore}% average match with current jobs
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-white">Job Board</h1>
          <p className="text-white/60">
            Find your next opportunity based on your skills
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Mobile Filters */}
      {showFilters && (
        <div className="lg:hidden">
          <FilterPanel />
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop Left Sidebar */}
        <div className="hidden w-64 flex-shrink-0 lg:block">
          <FilterPanel />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, company, or skills..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-violet-500/50"
            />
          </div>

          {/* Count */}
          {!loading && !error && (
            <p className="text-sm text-white/40">
              Showing {paginated.length} of {filtered.length} job
              {filtered.length !== 1 ? "s" : ""}
            </p>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex gap-4">
                    <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-xl bg-white/10" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-1/3 animate-pulse rounded bg-white/10" />
                      <div className="h-4 w-1/4 animate-pulse rounded bg-white/5" />
                      <div className="flex gap-2">
                        {[1, 2, 3].map((j) => (
                          <div
                            key={j}
                            className="h-6 w-16 animate-pulse rounded-full bg-white/5"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center">
              <div className="mb-3 text-3xl">💼</div>
              <h2 className="text-lg font-semibold text-white">
                No jobs found
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Try a different search or adjust the filters.
              </p>
            </div>
          )}

          {/* Job Cards */}
          {!loading &&
            !error &&
            paginated.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all hover:border-violet-500/30"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold text-white ${getAvatarColor(
                      job.company
                    )}`}
                  >
                    {getCompanyInitial(job.company)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-white leading-tight">
                        {job.title}
                      </h3>
                      <button
                        onClick={() => toggleBookmark(job.id)}
                        className="flex-shrink-0 text-white/30 hover:text-violet-400 transition-colors"
                      >
                        <Bookmark
                          className={`h-5 w-5 ${
                            bookmarked.has(job.id)
                              ? "fill-violet-400 text-violet-400"
                              : ""
                          }`}
                        />
                      </button>
                    </div>

                    <p className="mb-3 text-sm text-white/60">{job.company}</p>

                    <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-white/50">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location || "Remote"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        Full-time
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(job.date)}
                      </div>
                      {job.matchScore > 0 && (
                        <div className="flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2 py-0.5 text-violet-400">
                          ⚡ {job.matchScore}% match
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {job.tags?.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 capitalize"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                      >
                        Apply
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-9 w-9 rounded-xl text-sm transition-all ${
                        currentPage === page
                          ? "bg-violet-500 text-white"
                          : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}