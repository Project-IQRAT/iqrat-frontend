import React from 'react';
import { ArrowLeft, FileText, CheckCircle, ShieldAlert, UploadCloud, FileSpreadsheet, CheckSquare, Download, Database, Users, Briefcase } from 'lucide-react';

export const ReportsView = ({
    currentToken, setActiveTab,
    submittedReports, reportStats
}) => {

    const downloadReport = (offeringId) => {
        window.open(`${import.meta.env.VITE_API_URL}/api/v1/system/reports/export/grades/${offeringId}?token=${currentToken}`, '_blank');
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setActiveTab('overview')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white">Reporting & Official Records</h2>
                    <p className="text-xs text-slate-400 mt-1">Download finalized Excel/CSV records submitted by faculty.</p>
                </div>
            </div>

            {/* QUICK SYSTEM STATS (Top Row) */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">Submitted Reports</p>
                        <p className="text-3xl font-bold text-white mt-1">{submittedReports.length}</p>
                    </div>
                    <div className="p-4 bg-indigo-500/10 rounded-full"><FileText size={24} className="text-indigo-400"/></div>
                </div>
                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">Avg. Pass Rate</p>
                        <p className="text-3xl font-bold text-emerald-400 mt-1">{reportStats.avg_pass_rate}%</p>
                    </div>
                    <div className="p-4 bg-emerald-500/10 rounded-full"><CheckCircle size={24} className="text-emerald-400"/></div>
                </div>
                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">At-Risk Students</p>
                        <p className="text-3xl font-bold text-rose-400 mt-1">{reportStats.at_risk_count}</p>
                    </div>
                    <div className="p-4 bg-rose-500/10 rounded-full"><ShieldAlert size={24} className="text-rose-400"/></div>
                </div>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
                {/* MAIN PANEL: Lecturer Submissions */}
                <div className="lg:col-span-2 bg-[#0c0c0e] border border-white/10 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[500px]">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2"><UploadCloud size={16} className="text-emerald-500"/> Official Faculty Submissions</h3>
                        <p className="text-[10px] text-slate-500 mt-1">These reports have been finalized and signed off by the respective lecturers.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                        {submittedReports.length === 0 ? (
                            <div className="text-center text-slate-500 text-sm py-20 italic">No reports have been officially submitted yet.</div>
                        ) : (
                            submittedReports.map((report, i) => (
                                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                        <div className={`p-3 rounded-xl border ${report.type === 'grades' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                                            {report.type === 'grades' ? <FileSpreadsheet size={20} /> : <CheckSquare size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                                {report.subject} 
                                                <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-wider bg-black border border-white/10 text-slate-400">{report.type}</span>
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1">Submitted by <span className="text-slate-300 font-bold">{report.lecturer}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                                        <span className="text-[10px] text-slate-500 hidden md:block">{report.date}</span>
                                        <button 
                                            onClick={() => downloadReport(report.offering_id)}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 w-full sm:w-auto justify-center"
                                        >
                                            <Download size={14} /> Download CSV
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* SIDE PANEL: On-Demand Dynamic Exports */}
                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 shadow-xl h-fit">
                    <h3 className="text-sm font-bold text-white mb-4 border-b border-white/5 pb-4 flex items-center gap-2"><Database size={16} className="text-amber-500"/> Generate On-Demand</h3>
                    <div className="space-y-6">
                        <p className="text-xs text-slate-400 leading-relaxed">Need data immediately? Generate a live system snapshot before faculty finalize their records.</p>
                        
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">System-Wide Audit</label>
                            <button className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-between px-4 transition-colors">
                                <span className="flex items-center gap-2"><Users size={14} className="text-indigo-400"/> All Student Statuses</span>
                                <Download size={14} className="text-slate-500"/>
                            </button>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Faculty Workload</label>
                            <button className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-between px-4 transition-colors">
                                <span className="flex items-center gap-2"><Briefcase size={14} className="text-amber-400"/> Assigned Courses (CSV)</span>
                                <Download size={14} className="text-slate-500"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};