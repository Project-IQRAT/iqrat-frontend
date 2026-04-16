import React from "react";
import { Trophy } from "lucide-react";
import { Podium } from "./DashboardWidgets.jsx";

export const LeaderboardView = ({ dashboardStats }) => {
  const allStudents = dashboardStats?.top_10_students || dashboardStats?.top_students || [];
  const top3 = allStudents.slice(0, 3);
  const restOfClass = allStudents.slice(3, 10);

  return (
      <div className="max-w-4xl mx-auto py-8 animate-fade-in pb-24">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">Class Leaderboard</h2>
          <p className="text-slate-400 mb-10 text-center">Compete with your batchmates for the highest XP.</p>
          
          <Podium topStudents={top3} />

          {restOfClass.length > 0 && (
              <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-2 sm:p-6 mt-8 shadow-2xl max-w-2xl mx-auto">
                  <div className="px-4 pb-4 border-b border-white/5 mb-2">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Section Rank (4-10)</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                      {restOfClass.map((student, idx) => (
                          <div key={idx} className="flex justify-between items-center p-4 hover:bg-white/5 transition-colors rounded-xl group">
                              <div className="flex items-center gap-4 sm:gap-6">
                                  <span className="text-slate-500 font-mono font-bold w-6 text-center text-sm">{student?.rank || (idx + 4)}</span>
                                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white font-bold shadow-md">
                                      {student?.name && student.name !== "---" ? student.name.charAt(0).toUpperCase() : "-"}
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{student?.name || "---"}</p>
                                      <p className="text-[10px] text-slate-500 font-mono">{student?.roll || "---"}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="text-sm font-bold text-purple-400 font-mono">{student?.xp?.toLocaleString() || 0} XP</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>
  );
};