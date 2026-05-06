import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import type { ActiveView } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { RightPanel } from "./RightPanel";
import type { Notification } from "./TopNavbar";

type DashboardLayoutProps = {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  username: string;
  rightPanelData: {
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
  notifications: Notification[];
  onMarkAllRead: () => void;
  onSearch: (query: string) => void;
  chatUnread: number;
  onLogout: () => void;
  children: ReactNode;
};

export function DashboardLayout({
  activeView,
  onNavigate,
  username,
  rightPanelData,
  notifications,
  onMarkAllRead,
  onSearch,
  chatUnread,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050509] text-white">
      <div className="flex min-h-screen">
        <Sidebar
          activeView={activeView}
          onNavigate={onNavigate}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          chatUnread={chatUnread}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar
  username={username}
  notifications={notifications}
  onMarkAllRead={onMarkAllRead}
  onSearch={onSearch}
  onMenuOpen={() => setMobileOpen(true)}
  onLogout={onLogout}
/>

          <main className="flex min-w-0 flex-1">
            <div className="min-w-0 flex-1 p-4 lg:p-6">{children}</div>

            <RightPanel
              recommendedChallenges={rightPanelData.recommendedChallenges}
              trendingSkills={rightPanelData.trendingSkills}
              streak={rightPanelData.streak}
            />
          </main>
        </div>
      </div>
    </div>
  );
}