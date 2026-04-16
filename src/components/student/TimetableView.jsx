import React from "react";
import { Clock, GraduationCap } from "lucide-react";

export const TimetableView = ({ isLoadingTimetable, timetableData }) => {
  if (isLoadingTimetable) return <div className="text-center py-20 text-slate-500">Fetching Timetable...</div>;

  if (timetableData.length === 0) return (
      <div className="max-w-4xl mx-auto py-8 animate-fade-in text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Class TimeLine</h2>
          <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-12">
              <Clock size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-white">No Classes Scheduled</h3>
              <p className="text-slate-500 mt-2">Your administration has not scheduled any classes for your enrolled subjects yet.</p>
          </div>
      </div>
  );

  return (
      <div className="max-w-4xl mx-auto py-8 animate-fade-in pb-24">
          <h2 className="text-3xl font-bold text-white mb-8">Class TimeLine</h2>
          
          <div className="relative border-l-2 border-white/10 ml-4 space-y-12">
              {timetableData.map((dayData, index) => (
                  <div key={index} className="relative pl-8">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 bg-indigo-600 rounded-full border-4 border-[#0c0c0e]"></div>
                      <h3 className="text-xl font-bold text-white mb-6">{dayData.day}</h3>
                      
                      <div className="space-y-6">
                          {dayData.classes.map((cls, idx) => (
                              <div key={idx} className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-colors group">
                                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                      <div className="sm:col-span-3 text-center sm:text-left border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0 sm:pr-4">
                                          <p className="text-sm font-bold text-white">{cls.start}</p>
                                          <p className="text-xs text-slate-500 mt-1">{cls.end}</p>
                                      </div>
                                      <div className="sm:col-span-9 pl-0 sm:pl-2">
                                          <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{cls.subject}</h4>
                                          <div className="flex items-center gap-4 mt-2">
                                              <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-slate-300 border border-white/5 flex items-center gap-1">
                                                  {cls.room}
                                              </span>
                                              {cls.teacher && (
                                                  <span className="text-xs text-slate-500 flex items-center gap-1">
                                                      <GraduationCap size={14} /> {cls.teacher}
                                                  </span>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );
};