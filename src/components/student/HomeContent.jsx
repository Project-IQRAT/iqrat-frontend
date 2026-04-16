import React from "react";
import { Hand, Flame, Zap, Trophy, CalendarCheck, Sparkles } from "lucide-react";
import Iqrat3DAvatar from "../Iqrat3DAvatar.jsx";
import { GridStatCard, CompactStatCard, AIPredictionChart } from "./DashboardWidgets.jsx";

export const HomeContent = ({
    isLoadingCourses,
    profile,
    mood,
    dashboardStats,
    aiPredictions,
    subjects,
    nextClass
}) => {
    // --- NEW: PREVENTS THE 3D AVATAR FROM LAGGING/STUTTERING ON LOAD ---
    if (isLoadingCourses) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center animate-pulse">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">Syncing Live Data...</p>
            </div>
        );
    }

    return (
      <div className="animate-fade-in w-full pb-10">
        
        {/* HEADER GREETING */}
      <div className="mb-4 px-1 shrink-0">
         <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Hello, {profile.name.split(' ')[0]} 
            <Hand className="w-6 h-6 text-amber-400 -rotate-12" />
         </h2>
         <p className="text-xs text-slate-400">
            Performance: <span className={`font-bold capitalize ${mood === 'happy' ? 'text-emerald-400' : 'text-blue-400'}`}>{mood}</span>.
         </p>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="grid grid-cols-12 gap-3 mb-6 h-[280px] lg:hidden shrink-0">
         <div className="col-span-7 bg-[#0c0c0e] border border-white/10 rounded-2xl relative overflow-hidden shadow-2xl h-full flex items-center justify-center">
            <div className="absolute top-3 left-3 z-10"><span className="text-[8px] font-bold text-white/70 tracking-widest uppercase bg-black/40 px-2 py-1 rounded-md backdrop-blur-md border border-white/5">Live</span></div>
            <div className="absolute inset-0 w-full h-full"><Iqrat3DAvatar mood={mood} enableTracking={false} /></div>
         </div>
         <div className="col-span-5 flex flex-col gap-2 h-full">
            <div className="flex-1"><CompactStatCard title="Streak" value={dashboardStats.current_streak} sub="Days" icon={Flame} color="text-orange-400" /></div>
            <div className="flex-1"><CompactStatCard title="XP" value={dashboardStats.xp_points} sub="Level Up" icon={Zap} color="text-purple-400" /></div>
            <div className="flex-1"><CompactStatCard title="Rank" value={`#${dashboardStats.rank}`} sub="In Batch" icon={Trophy} color="text-emerald-400" /></div>
            <div className="flex-1"><CompactStatCard title="Avg" value={`${dashboardStats.avg_attendance}%`} sub="Overall" icon={CalendarCheck} color="text-blue-400" /></div>
         </div>
      </div>

      {/* DESKTOP LAYOUT - SCROLLABLE AND ORGANIC */}
      <div className="hidden lg:grid grid-cols-2 gap-6 w-full">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">
              
              {/* AREA A: Avatar */}
              <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl relative overflow-hidden shadow-2xl h-[380px] flex flex-col items-center justify-center group">
                  <div className="absolute top-5 left-6 z-10">
                      <span className="text-[10px] font-bold text-white/70 tracking-widest uppercase bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5">Live Status</span>
                  </div>
                  
                  {/* The Avatar Canvas */}
                  <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-center pt-8">
                      <Iqrat3DAvatar mood={mood} enableTracking={true} />
                  </div>
                  
                  <div className="absolute bottom-5 left-6 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 z-10 shadow-lg">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Mood:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-black capitalize ${mood === 'happy' ? 'bg-green-400' : 'bg-blue-400'}`}>{mood}</span>
                  </div>
              </div>

              {/* AREAS B, C, D, E: Stats Grid */}
              <div className="grid grid-cols-2 gap-6">
                  <GridStatCard title="Current Streak" value={dashboardStats.current_streak} sub="Daily Check-ins" icon={Flame} colorClass="text-orange-400" />
                  <GridStatCard title="XP Points" value={dashboardStats.xp_points.toLocaleString()} sub={dashboardStats.badge} icon={Zap} colorClass="text-purple-400" />
                  <GridStatCard title="Class Rank" value={`#${dashboardStats.rank}`} sub="In Your Batch" icon={Trophy} colorClass="text-emerald-400" />
                  <GridStatCard title="Avg Attendance" value={`${dashboardStats.avg_attendance}%`} sub="Overall" icon={CalendarCheck} colorClass="text-blue-400" />
              </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">
              
              {/* AREA F: AI Performance Analysis */}
              <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col h-[380px] shadow-xl">
                  <div className="flex items-center justify-between z-10 shrink-0 mb-4">
                      <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <Sparkles className="text-rose-400 w-5 h-5"/> AI Analysis
                          </h3>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Course Trajectory Forecast</p>
                      </div>
                  </div>
                  
                  <div className="flex-1 w-full min-h-0 flex flex-col">
                      {aiPredictions.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
                              <Sparkles size={24} className="mb-2 opacity-20"/>
                              {subjects.length === 0 
                                  ? "Enroll in a course to unlock AI predictions." 
                                  : "Not enough data to calculate trajectory."}
                          </div>
                      ) : (
                          <AIPredictionChart data={aiPredictions} />
                      )}
                  </div>
              </div>

              {/* AREA G: Up Next Class */}
              <div className="bg-gradient-to-br from-indigo-900/40 to-[#0c0c0e] border border-indigo-500/20 rounded-3xl p-6 lg:p-8 relative overflow-hidden group flex flex-col justify-center min-h-[220px]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] -mr-10 -mt-10 pointer-events-none"></div>
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span> Up Next
                  </p>
                  
                  <h3 className="text-3xl font-bold text-white leading-tight truncate">{nextClass.subject}</h3>
                  <p className="text-sm text-slate-400 mt-2">{nextClass.room} • {nextClass.code}</p>
                  
                  <div className="mt-6 bg-black/40 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                     <span className="text-sm font-mono text-slate-200">{nextClass.time}</span>
                     <span className="text-[10px] bg-white text-black font-bold px-3 py-1 rounded shadow-lg">SOON</span>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};