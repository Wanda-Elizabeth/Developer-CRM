import type { ReactNode } from "react";
import { Sidebar, type ActiveView } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { RightPanel } from "./RightPanel";

type Props = {
  children: ReactNode;
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  username: string;
  onLogout: () => void;
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
};

export default function DashboardLayout({
  children,
  activeView,
  onNavigate,
  rightPanelData,
  username,
  onLogout,
}: Props) {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-black via-gray-950 to-black text-white">
      <div className="flex h-full">
        
        {/* Left Sidebar — sticky, never scrolls */}
        <div className="hidden lg:flex lg:flex-col h-full flex-shrink-0">
          <Sidebar activeView={activeView} onNavigate={onNavigate} />
        </div>

        {/* Center — top navbar sticky, content scrolls */}
        <div className="flex flex-1 flex-col min-w-0 h-full">
          
          {/* Top Navbar — sticky */}
          <div className="flex-shrink-0">
            <TopNavbar username={username} onLogout={onLogout} />
          </div>

          {/* Scrollable content area */}
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="mx-auto max-w-5xl">
                {children}
              </div>
            </main>

            {/* Right Panel — sticky, never scrolls */}
            <div className="hidden xl:flex xl:flex-col h-full flex-shrink-0">
              <div className="h-full overflow-y-auto">
                <RightPanel
                  recommendedChallenges={rightPanelData.recommendedChallenges}
                  trendingSkills={rightPanelData.trendingSkills}
                  streak={rightPanelData.streak}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}