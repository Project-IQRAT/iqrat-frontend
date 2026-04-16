import React from 'react';
import { ArrowLeft, Activity, Calendar, Lock, Unlock, Save, ShieldAlert } from 'lucide-react';

export const PoliciesView = ({
    currentToken, setActiveTab, showToast,
    policies, setPolicies,
    isSavingPolicies, setIsSavingPolicies
}) => {

    const handleSavePolicies = async () => {
        setIsSavingPolicies(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/system/settings/academic`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
                body: JSON.stringify(policies)
            });
            const data = await res.json();
            if (res.ok) showToast(data.msg, "success");
            else showToast("Failed to update policies.", "error");
        } catch { showToast("Network error.", "error"); } 
        finally { setIsSavingPolicies(false); }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setActiveTab('overview')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white">System Configuration</h2>
                    <p className="text-xs text-slate-400 mt-1">Manage university-wide policies and semester bounds.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* ACADEMIC RULES CARD */}
                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-8 shadow-xl flex flex-col h-fit">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><Activity size={20} className="text-emerald-500"/> Academic Rules</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold block">Minimum Attendance Limit</label>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Students below this threshold are flagged "At Risk".</p>
                                </div>
                                <span className="text-2xl font-bold text-emerald-400">{policies.min_attendance_pct}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="50" max="100" 
                                value={policies.min_attendance_pct} 
                                onChange={(e) => setPolicies({...policies, min_attendance_pct: parseInt(e.target.value)})} 
                                className="w-full accent-emerald-500 cursor-pointer mt-2" 
                            />
                        </div>
                    </div>
                </div>

                {/* SEMESTER SETTINGS CARD */}
                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-8 shadow-xl flex flex-col h-fit">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><Calendar size={20} className="text-amber-500"/> Term Boundaries</h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Semester Start</label>
                                <div className="relative group">
                                    <input 
                                        type="date" 
                                        value={policies.semester_start_date} 
                                        onChange={(e) => setPolicies({...policies, semester_start_date: e.target.value})} 
                                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                        className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-amber-500 transition-colors cursor-pointer" 
                                    />
                                    <Calendar className="absolute left-3 top-3.5 text-amber-500/50 pointer-events-none group-hover:text-amber-500 transition-colors" size={16} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Semester End</label>
                                <div className="relative group">
                                    <input 
                                        type="date" 
                                        value={policies.semester_end_date} 
                                        onChange={(e) => setPolicies({...policies, semester_end_date: e.target.value})} 
                                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                        className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-amber-500 transition-colors cursor-pointer" 
                                    />
                                    <Calendar className="absolute left-3 top-3.5 text-amber-500/50 pointer-events-none group-hover:text-amber-500 transition-colors" size={16} />
                                </div>
                            </div>
                        </div>
                        
                        {/* MASTER LOCK - DANGEROUS ACTION */}
                        <div className={`p-5 rounded-2xl border transition-all ${policies.grade_freeze_active ? 'bg-rose-500/10 border-rose-500/30' : 'bg-white/5 border-white/10'}`}>
                            <div className="flex justify-between items-start">
                                <div className="pr-4">
                                    <h4 className={`font-bold text-sm flex items-center gap-2 ${policies.grade_freeze_active ? 'text-rose-400' : 'text-white'}`}>
                                        {policies.grade_freeze_active ? <Lock size={16}/> : <Unlock size={16}/>} 
                                        Master Grade Freeze
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Activating this will instantly lock all Lecturer gradebooks system-wide. No further marks can be edited or submitted until unlocked.</p>
                                </div>
                                <button 
                                    onClick={() => setPolicies({...policies, grade_freeze_active: !policies.grade_freeze_active})} 
                                    className={`p-2 rounded-xl transition-colors ${policies.grade_freeze_active ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                                >
                                    <ShieldAlert size={20}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* FLOATING ACTION BAR */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-xl border-t border-white/10 z-40 flex justify-end">
                <div className="max-w-7xl mx-auto w-full flex justify-end pr-4 lg:pr-8">
                    <button 
                        onClick={handleSavePolicies} 
                        disabled={isSavingPolicies} 
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Save size={18} /> {isSavingPolicies ? "Saving to Database..." : "Save Global Policies"}
                    </button>
                </div>
            </div>
        </div>
    );
};