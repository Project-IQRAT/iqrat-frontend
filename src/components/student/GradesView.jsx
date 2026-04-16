import React from "react";
import { X, UploadCloud, Eye } from "lucide-react";

export const GradesView = ({
    gradesData,
    selectedGradeSubject,
    setSelectedGradeSubject,
    showSubmitModal,
    setShowSubmitModal,
    submissionFile,
    setSubmissionFile,
    isSubmitting,
    handleAssignmentSubmit,
    formatImageUrl
}) => {
    if (gradesData.length === 0) return <div className="text-center py-20 text-slate-500">No grades available yet.</div>;

    const selectedData = gradesData[selectedGradeSubject] || gradesData[0];
    const assessments = selectedData.assessments || [];

    // --- STRICT 50/50 LOGIC ---
    const sessionalAssessments = assessments.filter(a => a.category.toLowerCase() !== 'exam');
    const finalAssessments = assessments.filter(a => a.category.toLowerCase() === 'exam');

    // Calculate Raw Sessional
    const rawSessionalMax = sessionalAssessments.reduce((sum, a) => sum + (a.total_marks || 0), 0);
    const rawSessionalObtained = sessionalAssessments.reduce((sum, a) => sum + (a.obtained_marks || 0), 0);
    
    // Scale Sessional to 50
    const scaledSessional = rawSessionalMax > 0 ? (rawSessionalObtained / rawSessionalMax) * 50 : 0;
    
    // Calculate Final Exam (Assumed to be out of 50 based on your rules, or scaled to 50)
    const rawFinalMax = finalAssessments.reduce((sum, a) => sum + (a.total_marks || 0), 0);
    const rawFinalObtained = finalAssessments.reduce((sum, a) => sum + (a.obtained_marks || 0), 0);
    const scaledFinal = rawFinalMax > 0 ? (rawFinalObtained / rawFinalMax) * 50 : 0;

    const totalScore = scaledSessional + scaledFinal;
    
    // Strict Pass/Fail Check
    const isSessionalPass = scaledSessional >= 25;
    const isFinalPass = scaledFinal >= 25;
    const hasTakenFinal = rawFinalMax > 0 && rawFinalObtained > 0;
    
    let currentStatus = "IN PROGRESS";
    let statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";

    if (!isSessionalPass && rawSessionalMax > 0) {
        currentStatus = "AT RISK (SESSIONAL < 25)";
        statusColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
    } else if (hasTakenFinal) {
        if (isSessionalPass && isFinalPass) {
            currentStatus = "PASSED";
            statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        } else {
            currentStatus = "FAILED";
            statusColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
        }
    }

    return (
        <div className="max-w-7xl mx-auto py-8 animate-fade-in pb-24 relative">
            <h2 className="text-2xl font-bold text-white mb-6">My Grades</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Panel: Subject List */}
                <div className="lg:col-span-4 space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Subject</p>
                    {gradesData.map((sub, i) => (
                        <div key={i} onClick={() => setSelectedGradeSubject(i)} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedGradeSubject === i ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/50' : 'bg-[#0c0c0e] border-white/10 hover:border-white/20'}`}>
                            <p className={`text-sm font-bold ${selectedGradeSubject === i ? 'text-white' : 'text-slate-200'}`}>{sub.subject_code}</p>
                            <p className={`text-xs ${selectedGradeSubject === i ? 'text-indigo-200' : 'text-slate-500'} truncate w-full`}>{sub.subject_name}</p>
                        </div>
                    ))}
                </div>

                {/* Right Panel: Grade Breakdown */}
                <div className="lg:col-span-8">
                    {/* Header Stats */}
                    <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedData.subject_name}</h3>
                                <p className="text-sm text-slate-400 mb-3">{selectedData.subject_code}</p>
                                <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase border tracking-widest ${statusColor}`}>
                                    {currentStatus}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-white">{totalScore.toFixed(1)} <span className="text-lg text-slate-500">/ 100</span></span>
                                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Total Score</p>
                            </div>
                        </div>
                        
                        {/* 50/50 Breakdown UI */}
                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Sessional Marks (Out of 50)</p>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xl font-bold ${scaledSessional >= 25 ? 'text-emerald-400' : 'text-rose-400'}`}>{scaledSessional.toFixed(1)}</span>
                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${scaledSessional >= 25 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${(scaledSessional/50)*100}%` }}></div>
                                    </div>
                                </div>
                                <p className="text-[9px] text-slate-500 mt-1">Requirement: &ge; 25.0</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Final Exam (Out of 50)</p>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xl font-bold ${scaledFinal >= 25 ? 'text-emerald-400' : hasTakenFinal ? 'text-rose-400' : 'text-slate-400'}`}>{hasTakenFinal ? scaledFinal.toFixed(1) : '--'}</span>
                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${scaledFinal >= 25 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${(scaledFinal/50)*100}%` }}></div>
                                    </div>
                                </div>
                                <p className="text-[9px] text-slate-500 mt-1">Requirement: &ge; 25.0</p>
                            </div>
                        </div>
                    </div>

                    {/* Assessment Table */}
                    <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 bg-white/5">
                            <h4 className="font-bold text-white text-sm">Detailed Assessments</h4>
                        </div>
                        <div className="grid grid-cols-12 bg-black/40 border-b border-white/5 p-3 text-[10px] font-bold text-slate-500 uppercase">
                            <div className="col-span-5">Assessment Name</div>
                            <div className="col-span-2 text-center">Weight</div>
                            <div className="col-span-2 text-center">Max Marks</div>
                            <div className="col-span-3 text-right">Obtained Marks</div>
                        </div>
                        <div className="divide-y divide-white/5 max-h-96 overflow-y-auto scrollbar-hide">
                            {assessments.length === 0 ? (
                                <div className="p-6 text-center text-slate-500 text-sm">No assessments added by the lecturer yet.</div>
                            ) : (
                                assessments.map((ass, index) => (
                                    <div key={index} className="grid grid-cols-12 p-4 items-center hover:bg-white/5">
                                        <div className="col-span-5">
                                            <p className="text-sm font-bold text-white">{ass.name}</p>
                                            <p className={`text-[10px] uppercase ${ass.category.toLowerCase() === 'exam' ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>{ass.category}</p>
                                            
                                            {/* --- SUBMIT BUTTONS (Unchanged) --- */}
                                            {(ass.category === "Assignment" || ass.category === "Presentation") && (
                                                <div className="flex gap-2 mt-2">
                                                    {ass.lecturer_file_path && (
                                                        <a href={formatImageUrl(ass.lecturer_file_path)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded hover:bg-emerald-600/40 transition-colors">
                                                            <Eye size={12} /> View
                                                        </a>
                                                    )}
                                                    {ass.status !== "Submitted" && ass.status !== "Graded" && (
                                                        <button onClick={() => setShowSubmitModal(ass)} className="flex items-center gap-1 text-[10px] font-bold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded hover:bg-indigo-600/40 transition-colors">
                                                            <UploadCloud size={12} /> Submit
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-span-2 text-center font-mono text-slate-400 text-xs">
                                            {ass.category.toLowerCase() === 'exam' ? 'Final (50%)' : 'Sessional'}
                                        </div>
                                        <div className="col-span-2 text-center font-mono text-slate-300">
                                            {ass.total_marks}
                                        </div>
                                        <div className="col-span-3 text-right font-mono font-bold">
                                            {ass.obtained_marks !== null ? (
                                                <span className="text-emerald-400">{ass.obtained_marks}</span>
                                            ) : ass.status === "Submitted" ? (
                                                <span className="text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20 text-[10px]">Submitted</span>
                                            ) : (
                                                <span className="text-slate-500 px-2 py-0.5 bg-white/5 rounded border border-white/10 text-[10px]">Pending</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SUBMISSION MODAL (Unchanged) --- */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Submit Assignment</h3>
                            <button onClick={() => {setShowSubmitModal(null); setSubmissionFile(null);}} className="text-slate-400 hover:text-white"><X size={20}/></button>
                        </div>
                        
                        <div className="bg-black/50 border border-white/5 rounded-xl p-4 mb-4">
                            <h4 className="text-sm font-bold text-white">{showSubmitModal.name}</h4>
                            <p className="text-xs text-slate-400 mt-1">Max Marks: {showSubmitModal.total_marks}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative border border-dashed border-white/10 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500/50 transition-colors group bg-black/30">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => {
                                        if(e.target.files && e.target.files.length > 0) setSubmissionFile(e.target.files[0]);
                                    }}
                                />
                                <UploadCloud className={`mx-auto mb-2 ${submissionFile ? 'text-indigo-400 scale-110' : 'text-slate-500'} transition-transform`} size={24} />
                                <p className={`text-xs ${submissionFile ? 'text-indigo-300 font-bold' : 'text-slate-400'}`}>
                                    {submissionFile ? submissionFile.name : "Click or drag your answer file here"}
                                </p>
                            </div>
                            
                            <button 
                                onClick={handleAssignmentSubmit} 
                                disabled={isSubmitting || !submissionFile} 
                                className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors disabled:opacity-50 flex justify-center gap-2"
                            >
                                {isSubmitting ? "Uploading..." : <><UploadCloud size={18}/> Turn In Assignment</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};