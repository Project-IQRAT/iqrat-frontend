import React from "react";

export const AttendanceHistoryView = ({ 
    subjects, 
    selectedAttendanceSubject, 
    setSelectedAttendanceSubject, 
    attendanceHistory 
}) => {
    if (subjects.length === 0) return <div className="text-center py-20 text-slate-500">No enrolled subjects to display attendance for.</div>;
    
    const selectedSubData = subjects[selectedAttendanceSubject] || subjects[0];
    const filteredLogs = attendanceHistory.filter(log => log.subject_code === selectedSubData.code);

    return (
        <div className="max-w-7xl mx-auto py-8 animate-fade-in pb-24">
            <h2 className="text-2xl font-bold text-white mb-6">Attendance History</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Subject</p>
                    {subjects.map((sub, i) => (
                        <div key={i} onClick={() => setSelectedAttendanceSubject(i)} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedAttendanceSubject === i ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/50' : 'bg-[#0c0c0e] border-white/10 hover:border-white/20'}`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className={`text-sm font-bold ${selectedAttendanceSubject === i ? 'text-white' : 'text-slate-200'}`}>{sub.code}</p>
                                    <p className={`text-xs ${selectedAttendanceSubject === i ? 'text-indigo-200' : 'text-slate-500'} truncate w-48`}>{sub.name}</p>
                                </div>
                                <div className={`text-sm font-bold ${selectedAttendanceSubject === i ? 'text-white' : 'text-emerald-400'}`}>{sub.attendance}%</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-8">
                    <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 mb-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedSubData.name}</h3>
                                <p className="text-sm text-slate-400">{selectedSubData.code}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-white">{selectedSubData.attendance}%</span>
                                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Attendance</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                                <p className="text-2xl font-bold text-emerald-400">{selectedSubData.presents}</p>
                                <p className="text-[10px] uppercase font-bold text-emerald-600">Presents</p>
                            </div>
                            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-center">
                                <p className="text-2xl font-bold text-rose-400">{selectedSubData.absents}</p>
                                <p className="text-[10px] uppercase font-bold text-rose-600">Absents</p>
                            </div>
                            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl text-center">
                                <p className="text-2xl font-bold text-indigo-400">{selectedSubData.totalHeld || 0}</p>
                                <p className="text-[10px] uppercase font-bold text-indigo-600">Classes Held</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 bg-white/5">
                            <h4 className="font-bold text-white text-sm">Scan Log</h4>
                        </div>
                        <div className="grid grid-cols-12 bg-black/40 border-b border-white/5 p-3 text-[10px] font-bold text-slate-500 uppercase">
                            <div className="col-span-2 text-center">Sr No</div>
                            <div className="col-span-5">Date</div>
                            <div className="col-span-5 text-right">Status</div>
                        </div>
                        <div className="divide-y divide-white/5 max-h-64 overflow-y-auto scrollbar-hide">
                            {filteredLogs.length === 0 ? (
                                <div className="p-6 text-center text-slate-500 text-sm">No scans recorded for this subject yet.</div>
                            ) : (
                                filteredLogs.map((log, index) => (
                                    <div key={index} className="grid grid-cols-12 p-3 items-center hover:bg-white/5">
                                        <div className="col-span-2 text-center text-xs text-slate-500">{filteredLogs.length - index}</div>
                                        <div className="col-span-5 text-xs text-slate-300 font-mono">{log.date}</div>
                                        <div className="col-span-5 text-right">
                                            <span className={`text-[10px] px-2 py-1 rounded font-bold ${log.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                {log.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};