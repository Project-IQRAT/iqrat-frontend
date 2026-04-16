import React from "react";
import { Calendar } from "lucide-react";

export const TimetableView = ({ isLoading, groupedTimetable }) => (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
        <h2 className="text-2xl font-bold text-white mb-6">Weekly Schedule</h2>
        {isLoading ? (
           <div className="text-center py-20 text-slate-500">Loading Timetable...</div>
        ) : groupedTimetable.length === 0 ? (
           <div className="text-center py-20 text-slate-500 flex flex-col items-center"><Calendar size={48} className="opacity-50 mb-4" />No classes scheduled yet.</div>
        ) : (
            <div className="grid gap-4">
                {groupedTimetable.map(dayObj => {
                    return (
                        <div key={dayObj.day} className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-5">
                            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">{dayObj.day}</h3>
                            <div className="space-y-3">
                                {dayObj.classes.map((cls, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="text-center min-w-[80px]"><p className="text-sm font-bold text-white">{cls.start}</p><p className="text-xs text-slate-500">{cls.end}</p></div>
                                        <div className="w-1 h-10 bg-indigo-500 rounded-full"></div>
                                        <div><p className="text-sm font-bold text-indigo-300">{cls.code}</p><p className="text-xs text-slate-400">{cls.type} • {cls.room}</p></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
    </div>
);