import React from "react";
import { LayoutDashboard, BookOpen, CalendarCheck, BarChart3, Trophy, Clock, LogOut } from "lucide-react";
import defaultLogoImg from "../../assets/iqrat-logo.png";

export const StudentSidebar = ({ 
    isDrawerOpen, 
    setDrawerOpen, 
    activeTab, 
    setActiveTab, 
    handleLogout 
}) => {
  return (
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#0c0c0e] border-r border-white/10 shadow-2xl transform transition-transform duration-200 ease-out ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <img src={defaultLogoImg} className="h-8 w-8 rounded-lg border border-white/10 object-cover" alt="Logo" />
              <span className="font-bold text-lg text-white tracking-wide">IQRAT</span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
            {[
              { id: "home", label: "Home", icon: <LayoutDashboard size={20} /> },
              { id: "courses", label: "Courses", icon: <BookOpen size={20} /> },
              { id: "attendance", label: "Attendance History", icon: <CalendarCheck size={20} /> },
              { id: "grades", label: "Grades", icon: <BarChart3 size={20} /> },
              { id: "leaderboard", label: "Leaderboard", icon: <Trophy size={20} /> },
              { id: "timetable", label: "Class TimeLine", icon: <Clock size={20} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setDrawerOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 ${
                  activeTab === item.id ? "bg-white/10 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>

          </div>
      </aside>
  );
};