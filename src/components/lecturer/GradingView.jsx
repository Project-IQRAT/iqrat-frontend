import React from "react";
import { Lock, Unlock, Plus, Save, Send, Trash2 } from "lucide-react";

export const GradingView = ({
    isGradebookLocked,
    setIsGradebookLocked,
    setShowAddAssessmentModal,
    handleSaveGrades,
    selectedClass,
    showToast,
    currentToken,
    API_BASE_URL,
    assessments,
    handleDeleteAssessment,
    roster,
    updateMark
}) => {

    // --- NEW: STRICT 50/50 LECTURER MATH ---
    const calculateGradeStatus = (studentMarks) => {
        if (!studentMarks) return { sessional: 0, final: 0, total: 0, status: "IN PROGRESS", isFail: false };

        const sessionalAssessments = assessments.filter(a => a.type.toLowerCase() !== 'exam' && a.type.toLowerCase() !== 'final term');
        const finalAssessments = assessments.filter(a => a.type.toLowerCase() === 'exam' || a.type.toLowerCase() === 'final term');

        // Raw Sessional
        const rawSessionalMax = sessionalAssessments.reduce((sum, a) => sum + (a.max || 0), 0);
        const rawSessionalObtained = sessionalAssessments.reduce((sum, a) => sum + (studentMarks[a.id] || 0), 0);
        const scaledSessional = rawSessionalMax > 0 ? (rawSessionalObtained / rawSessionalMax) * 50 : 0;

        // Raw Final
        const rawFinalMax = finalAssessments.reduce((sum, a) => sum + (a.max || 0), 0);
        const rawFinalObtained = finalAssessments.reduce((sum, a) => sum + (studentMarks[a.id] || 0), 0);
        const scaledFinal = rawFinalMax > 0 ? (rawFinalObtained / rawFinalMax) * 50 : 0;

        const totalScore = scaledSessional + scaledFinal;
        
        const isSessionalPass = scaledSessional >= 25;
        const isFinalPass = scaledFinal >= 25;
        const hasTakenFinal = rawFinalMax > 0 && rawFinalObtained > 0;

        let status = "IN PROGRESS";
        let isFail = false;

        if (!isSessionalPass && rawSessionalMax > 0) {
            status = "FAIL (Sessional)";
            isFail = true;
        } else if (hasTakenFinal) {
            if (isSessionalPass && isFinalPass) {
                status = "PASS";
                isFail = false;
            } else {
                status = "FAIL (Final)";
                isFail = true;
            }
        }

        return { sessional: scaledSessional, final: scaledFinal, total: totalScore, status, isFail };
    };

    return (
        <div className="max-w-full pb-20 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Grading & Results 
                        {isGradebookLocked && <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-1 rounded border border-rose-500/30 flex items-center gap-1"><Lock size={12}/> Finalized</span>}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Strict 50/50 System (Requires {">="} 25 in both Sessional and Final to pass).</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsGradebookLocked(!isGradebookLocked)} 
                        className={`px-4 py-2 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors ${isGradebookLocked ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/30' : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30'}`}
                    >
                        {isGradebookLocked ? <><Unlock size={16} /> Unlock Grades</> : <><Lock size={16} /> Finalize Semester</>}
                    </button>

                    {!isGradebookLocked && (
                        <button onClick={() => setShowAddAssessmentModal(true)} className="px-4 py-2 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-indigo-600/30"><Plus size={16} /> Add Column Manually</button>
                    )}
                    <button onClick={handleSaveGrades} disabled={isGradebookLocked} className="px-4 py-2 bg-white text-black font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"><Save size={16} /> Save Changes</button>
                    
                    {/* SUBMIT TO ADMIN BUTTON */}
                    <button 
                        onClick={async () => {
                            if (!selectedClass) return showToast("No class selected!", "error");
                            if (window.confirm("Are you sure you want to officially submit these grades to the Administration?")) {
                                try {
                                    const res = await fetch(`${API_BASE_URL}/system/reports/submit-to-admin`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
                                        body: JSON.stringify({ offering_id: selectedClass.id, report_type: 'grades' })
                                    });
                                    const data = await res.json();
                                    if (res.ok) showToast(data.msg, "success");
                                    else showToast(`Error: ${data.detail}`, "error");
                                } catch (e) {
                                    showToast("Network error while submitting.", "error");
                                }
                            }
                        }}
                        disabled={!isGradebookLocked} 
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={!isGradebookLocked ? "You must Finalize Semester before submitting." : "Send to Admin"}
                    >
                        <Send size={16} /> Submit Record
                    </button>
                </div>
            </div>
            <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-xs uppercase bg-black/40 text-slate-300 font-bold border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 sticky left-0 bg-[#0c0c0e] z-10 border-r border-white/5">Student</th>
                                {assessments.map(assessment => {
                                    const isFinal = assessment.type.toLowerCase() === 'exam' || assessment.type.toLowerCase() === 'final term';
                                    return (
                                        <th key={assessment.id} className={`px-4 py-4 text-center border-r border-white/5 min-w-[120px] ${isFinal ? 'bg-indigo-900/10' : ''}`}>
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-1">
                                                    <span className={isFinal ? 'text-indigo-300' : ''}>{assessment.type}</span>
                                                    {(!assessment.locked && !isGradebookLocked) ? (
                                                        <button onClick={() => handleDeleteAssessment(assessment.id)} className="text-slate-600 hover:text-rose-500 ml-1"><Trash2 size={10} /></button>
                                                    ) : (
                                                        <Lock size={10} className="text-slate-600 ml-1 opacity-50" />
                                                    )}
                                                </div>
                                                <span className="text-[9px] opacity-50 mt-0.5">Max: {assessment.max}</span>
                                            </div>
                                        </th>
                                    );
                                })}
                                <th className="px-6 py-4 text-center font-bold text-slate-400 border-r border-white/5 bg-black/60">Sessional (50)</th>
                                <th className="px-6 py-4 text-center font-bold text-slate-400 border-r border-white/5 bg-black/60">Final (50)</th>
                                <th className="px-6 py-4 text-center font-bold text-white bg-emerald-900/10">Status / Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {roster.map((student) => {
                                const gradeInfo = calculateGradeStatus(student.marks);
                                return (
                                    <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 sticky left-0 bg-[#0c0c0e] group-hover:bg-[#151518] transition-colors border-r border-white/5"><p className="font-bold text-white">{student.name}</p><p className="font-mono text-[10px] text-slate-500">{student.roll}</p></td>
                                        {assessments.map(assessment => (
                                            <td key={assessment.id} className="px-2 py-4 text-center border-r border-white/5">
                                                <input 
                                                    type="number" 
                                                    value={student.marks ? student.marks[assessment.id] || '' : ''} 
                                                    onChange={(e) => updateMark(student.id, assessment.id, e.target.value)} 
                                                    disabled={isGradebookLocked}
                                                    className={`w-16 bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-center text-white focus:border-indigo-500 outline-none text-xs ${assessment.locked && assessment.id !== 'mid' && assessment.id !== 'final' ? 'opacity-50' : ''} disabled:opacity-50 disabled:cursor-not-allowed`} 
                                                    placeholder="-" 
                                                    max={assessment.max} 
                                                />
                                            </td>
                                        ))}
                                        <td className={`px-6 py-4 text-center font-mono font-bold border-r border-white/5 ${gradeInfo.sessional >= 25 ? 'text-emerald-400' : 'text-rose-400'}`}>{gradeInfo.sessional.toFixed(1)}</td>
                                        <td className={`px-6 py-4 text-center font-mono font-bold border-r border-white/5 ${gradeInfo.final >= 25 ? 'text-emerald-400' : gradeInfo.final > 0 ? 'text-rose-400' : 'text-slate-500'}`}>{gradeInfo.final > 0 ? gradeInfo.final.toFixed(1) : '--'}</td>
                                        <td className={`px-6 py-4 text-center bg-emerald-900/5 group-hover:bg-emerald-900/10 transition-colors ${gradeInfo.isFail ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            <span className="font-bold text-lg">{gradeInfo.total.toFixed(1)}</span>
                                            <span className="block text-[8px] uppercase tracking-widest mt-1 opacity-80">{gradeInfo.status}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};