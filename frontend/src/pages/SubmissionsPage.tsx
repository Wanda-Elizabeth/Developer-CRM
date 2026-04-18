import {
  ExternalLink,
  Heart,
  MessageSquare,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

export type UserSubmission = {
  id: number;
  github_link: string;
  user_name: string;
  created_at?: string;
  likes?: number;
  challengeTitle: string;
  difficulty: string;
  status?: "approved" | "pending" | "rejected";
  comments?: number;
};

type Props = {
  submissions: UserSubmission[];
};

function formatRelativeDate(date?: string) {
  if (!date) return "Recently";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Recently";

  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${Math.max(diffMins, 1)} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;

  return parsed.toLocaleDateString();
}

function getDerivedStatus(
  submission: UserSubmission
): "approved" | "pending" | "rejected" {
  if (submission.status) return submission.status;

  const likes = submission.likes || 0;
  if (likes >= 10) return "approved";
  if (likes <= 1) return "pending";
  return "approved";
}

export function SubmissionsPage({ submissions }: Props) {
  const normalized = submissions.map((submission, index) => {
    const derivedStatus = getDerivedStatus(submission);

    return {
      ...submission,
      status: derivedStatus,
      comments: submission.comments ?? Math.max(0, Math.floor((submission.likes || 0) / 3)),
      submittedAtLabel: formatRelativeDate(submission.created_at),
      sortKey: submission.created_at
        ? new Date(submission.created_at).getTime()
        : Date.now() - index,
    };
  });

  const sorted = [...normalized].sort((a, b) => b.sortKey - a.sortKey);

  const stats = {
    total: sorted.length,
    approved: sorted.filter((s) => s.status === "approved").length,
    pending: sorted.filter((s) => s.status === "pending").length,
    rejected: sorted.filter((s) => s.status === "rejected").length,
  };

  const getStatusIcon = (status: "approved" | "pending" | "rejected") => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case "pending":
        return <Clock className="h-5 w-5 text-amber-400" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-400" />;
    }
  };

  const getStatusBadge = (status: "approved" | "pending" | "rejected") => {
    const styles = {
      approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return styles[status];
  };

  if (sorted.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="mb-1 text-white">My Submissions</h1>
          <p className="text-white/60">
            Track all your challenge submissions and their status
          </p>
        </div>

        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center">
          <div className="mb-3 text-3xl">📭</div>
          <h2 className="text-lg font-semibold text-white">No submissions yet</h2>
          <p className="mt-2 text-sm text-white/60">
            Once you submit a GitHub solution, it will show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-white">My Submissions</h1>
        <p className="text-white/60">
          Track all your challenge submissions and their status
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <p className="mb-1 text-sm text-white/60">Total</p>
          <p className="text-2xl font-semibold text-white">{stats.total}</p>
        </div>

        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-xl">
          <p className="mb-1 text-sm text-emerald-400/80">Approved</p>
          <p className="text-2xl font-semibold text-emerald-400">{stats.approved}</p>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-xl">
          <p className="mb-1 text-sm text-amber-400/80">Pending</p>
          <p className="text-2xl font-semibold text-amber-400">{stats.pending}</p>
        </div>

        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 backdrop-blur-xl">
          <p className="mb-1 text-sm text-red-400/80">Rejected</p>
          <p className="text-2xl font-semibold text-red-400">{stats.rejected}</p>
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((submission) => (
          <div
            key={submission.id}
            className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:border-violet-500/30"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  {getStatusIcon(submission.status)}
                  <h3 className="text-white">{submission.challengeTitle}</h3>
                  <span
                    className={`rounded-full border px-2 py-1 text-xs ${getStatusBadge(
                      submission.status
                    )}`}
                  >
                    {submission.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {submission.submittedAtLabel}
                  </div>

                  <span className="text-violet-400">{submission.difficulty}</span>
                  <span className="text-white/40">@{submission.user_name}</span>
                </div>
              </div>

              <a
                href={submission.github_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white transition-colors hover:bg-white/10"
              >
                View Code
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <div className="flex items-center gap-6 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 text-white/60">
                <Heart className="h-4 w-4" />
                <span className="text-sm">{submission.likes || 0}</span>
              </div>

              <div className="flex items-center gap-2 text-white/60">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">{submission.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}