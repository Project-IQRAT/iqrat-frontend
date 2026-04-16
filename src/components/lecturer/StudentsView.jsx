import React from "react";
import { ShieldCheck, AlertTriangle, Bell } from "lucide-react";

export const StudentsView = ({
    roster,
    assessments,
    filterAtRisk,
    setFilterAtRisk,
    makeAllEligible,
    makeStudentEligible,
    makeStudentIneligible,
    handleSendAlert
}) => {
    // --- NEW: USE THE STRICT 50/50 MATH FOR RISK DETECTION ---
    const calculateGradeStatus = (studentMarks) => {
        if (!studentMarks) return { total: 0, isFail: false, isAtRisk: true };

        const sessionalAssessments = assessments.filter(a => a.type.toLowerCase() !== 'exam' && a.type.toLowerCase() !== 'final term');
        const finalAssessments = assessments.filter(a => a.type.toLowerCase() === 'exam' || a.type.toLowerCase() === 'final term');

        const rawSessionalMax = sessionalAssessments.reduce((sum, a) => sum + (a.max || 0), 0);
        const rawSessionalObtained = sessionalAssessments.reduce((sum, a) => sum + (studentMarks[a.id] || 0), 0);
        const scaledSessional = rawSessionalMax > 0 ? (rawSessionalObtained / rawSessionalMax) * 50 : 0;

        const rawFinalMax = finalAssessments.reduce((sum, a) => sum + (a.max || 0), 0);
        const rawFinalObtained = finalAssessments.reduce((sum, a) => sum + (studentMarks[a.id] || 0), 0);
        const scaledFinal = rawFinalMax > 0 ? (rawFinalObtained / rawFinalMax) * 50 : 0;

        const totalScore = scaledSessional + scaledFinal;
        
        const isSessionalFail = rawSessionalMax > 0 && scaledSessional < 25;
        const isFinalFail = rawFinalMax > 0 && scaledFinal < 25;

        // If they have failed either half, or total is below 50, they are at risk
        const isAtRisk = isSessionalFail || isFinalFail || totalScore < 50;

        return { total: totalScore, isFail: isSessionalFail || isFinalFail, isAtRisk };
    };

    // Dynamically calculate grades and risk status
    const dynamicRoster = roster.map(s => {
        const gradeInfo = calculateGradeStatus(s.marks);
        const isAtRisk = s.attendancePct < 75 || gradeInfo.isAtRisk;
        return { ...s, avgGrade: gradeInfo.total, isAtRisk };
    });

    const displayRoster = filterAtRisk ? dynamicRoster.filter(s => s.isAtRisk) : dynamicRoster;

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Student Performance & Risk</h2>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer text-sm text-slate-400 hover:text-white transition-colors">
                        <input type="checkbox" checked={filterAtRisk} onChange={e => setFilterAtRisk(e.target.checked)} className="accent-indigo-500 w-4 h-4 cursor-pointer" />
                        Show At-Risk Students Only
                    </label>
                </div>
                <button onClick={makeAllEligible} className="px-4 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-2 transition-all">
                    <ShieldCheck size={16} /> Make All Eligible
                </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {displayRoster.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">No students match this view.</div>
                ) : displayRoster.map(s => (
                    <div key={s.id} className={`bg-[#0c0c0e] border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between transition-all group ${s.isAtRisk ? 'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-white/10 hover:border-white/20'}`}>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white font-bold">{s.name.charAt(0)}</div>
                            <div><p className="text-sm font-bold text-white">{s.name}</p><p className="text-xs text-slate-500 font-mono">{s.roll}</p></div>
                        </div>
                        <div className="flex items-center gap-6 md:gap-8 w-full md:w-auto mt-4 md:mt-0 flex-wrap justify-end">
                            <div className="text-center"><p className="text-[10px] text-slate-500 uppercase tracking-wide">Attendance</p><p className={`text-lg font-bold ${s.attendancePct < 75 ? 'text-rose-500' : 'text-emerald-400'}`}>{s.attendancePct}%</p></div>
                            <div className="text-center"><p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Grade</p><p className={`text-lg font-bold ${s.avgGrade < 50 ? 'text-rose-500' : 'text-white'}`}>{s.avgGrade.toFixed(1)}%</p></div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => makeStudentEligible(s.id)} className="px-3 py-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold hover:bg-indigo-600/20 transition-colors">Make Eligible</button>
                                <button onClick={() => makeStudentIneligible(s.id)} className="px-3 py-1.5 rounded-lg bg-rose-600/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold hover:bg-rose-600/20 transition-colors">Make Ineligible</button>
                                
                                {s.isAtRisk && (<span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded-full flex items-center gap-1 animate-pulse"><AlertTriangle size={12} /> At Risk</span>)}
                                
                                <button onClick={() => handleSendAlert(s, s.avgGrade)} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-400 transition-colors" title="Send Official Warning"><Bell size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};