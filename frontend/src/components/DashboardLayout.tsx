import type { ReactNode } from "react";
import { Sidebar, type ActiveView } from "./Sidebar";
import {TopNavbar} from "./TopNavbar";
import { RightPanel } from "./RightPanel";
type Props = {
  children: ReactNode;
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  username: string;
  onLogout: () => void;
};

export default function DashboardLayout({
  children,
  activeView,
  onNavigate,
  username,
  onLogout,
}: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white">
      <div className="flex min-h-screen">
        <Sidebar activeView={activeView} onNavigate={onNavigate} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar username={username} onLogout={onLogout} />

          <main className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </div>

            <RightPanel />
          </main>
        </div>
      </div>
    </div>
  );
}