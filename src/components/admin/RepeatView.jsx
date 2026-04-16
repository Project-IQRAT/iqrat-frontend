import React from 'react';
import { ArrowLeft, Layers, User, Search, CheckCircle, BookOpen, Save } from 'lucide-react';

export const RepeatView = ({
    currentToken, setActiveTab, showToast,
    usersList, allSemesters, activeTerm, setActiveTerm,
    departments, repeatDegrees, repeatSections, allSubjects,
    repeatForm, setRepeatForm,
    repeatSearchTerm, setRepeatSearchTerm,
    isSubmitting, setIsSubmitting
}) => {

    const handleEnrollRepeat = async () => {
        if (!repeatForm.reg_no || !repeatForm.subject_id || !repeatForm.semester_id) {
            return showToast("Please ensure Student Roll No, Semester, and Subject are selected.", "error");
        }
        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/enroll-repeat`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
                body: JSON.stringify({
                    reg_no: repeatForm.reg_no,
                    subject_id: parseInt(repeatForm.subject_id),
                    semester_id: parseInt(repeatForm.semester_id),
                    section_id: parseInt(repeatForm.section_id) || null
                })
            });
            const data = await res.json();
            if (res.ok) {
                showToast(`Success: ${data.msg}`, "success");
                setRepeatForm({ ...repeatForm, reg_no: '', subject_id: '', section_id: '' });
                setRepeatSearchTerm("");
            } else {
                showToast(`Error: ${data.detail}`, "error");
            }
        } catch {
            showToast("Network Error.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 1. Filter students based on search term
    const matchedStudents = usersList.filter(u => 
        u.role?.toLowerCase() === 'student' && 
        u.system_id && 
        u.system_id.toLowerCase().includes(repeatSearchTerm.toLowerCase())
    );

    // 2. Filter semesters based on the active term (Fall/Spring)
    const currentSemesters = allSemesters.filter(s => 
        activeTerm === "Odd" ? s.semester_no % 2 !== 0 : s.semester_no % 2 === 0
    );

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setActiveTab('overview')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white">Repeat Subject Enrollment</h2>
                    <p className="text-xs text-slate-400 mt-1">Assign a single subject to a student outside their regular batch.</p>
                </div>
            </div>

            <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-8 shadow-xl">
                {/* STEP 1: Academic Scope */}
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3"><Layers size={16} className="text-indigo-400"/> 1. Academic Scope</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Department</label>
                        <select value={repeatForm.dept_id} onChange={e => setRepeatForm({...repeatForm, dept_id: e.target.value, degree_id: ''})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors">
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Major / Degree</label>
                        <select value={repeatForm.degree_id} onChange={e => setRepeatForm({...repeatForm, degree_id: e.target.value})} disabled={!repeatForm.dept_id} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none disabled:opacity-50 focus:border-indigo-500 transition-colors">
                            <option value="">Select Degree</option>
                            {repeatDegrees.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* STEP 2: Student Search */}
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3"><User size={16} className="text-amber-400"/> 2. Select Student</h3>
                <div className="mb-8">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Search Roll Number</label>
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-3.5 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="e.g. 0122-BSCS-22" 
                            value={repeatSearchTerm}
                            onChange={e => {
                                setRepeatSearchTerm(e.target.value);
                                // Auto-select if exact match
                                if (matchedStudents.length === 1 && e.target.value.toUpperCase() === matchedStudents[0].system_id.toUpperCase()) {
                                    setRepeatForm({...repeatForm, reg_no: matchedStudents[0].system_id});
                                }
                            }}
                            className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-amber-500 transition-colors"
                        />
                        {repeatSearchTerm && matchedStudents.length > 0 && repeatForm.reg_no !== repeatSearchTerm.toUpperCase() && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-48 overflow-y-auto">
                                {matchedStudents.map(s => (
                                    <button key={s.id} onClick={() => { setRepeatForm({...repeatForm, reg_no: s.system_id}); setRepeatSearchTerm(s.system_id); }} className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 text-sm transition-colors">
                                        <span className="font-bold text-amber-400">{s.system_id}</span> <span className="text-slate-300 ml-2">{s.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {repeatForm.reg_no && <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1"><CheckCircle size={12}/> Target Student Selected: {repeatForm.reg_no}</p>}
                </div>

                {/* STEP 3: Course Selection */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2"><BookOpen size={16} className="text-emerald-400"/> 3. Subject Assignment</h3>
                    <div className="flex bg-black border border-white/10 rounded-lg p-1">
                        <button onClick={() => setActiveTerm("Odd")} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${activeTerm === "Odd" ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-white"}`}>Fall (Odd)</button>
                        <button onClick={() => setActiveTerm("Even")} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${activeTerm === "Even" ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-white"}`}>Spring (Even)</button>
                    </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Target Semester</label>
                        <select value={repeatForm.semester_id} onChange={e => setRepeatForm({...repeatForm, semester_id: e.target.value, section_id: ''})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors">
                            <option value="">Select Semester...</option>
                            {currentSemesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Subject</label>
                        <select value={repeatForm.subject_id} onChange={e => setRepeatForm({...repeatForm, subject_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors">
                            <option value="">Select Subject...</option>
                            {allSubjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Target Section</label>
                        <select value={repeatForm.section_id} onChange={e => setRepeatForm({...repeatForm, section_id: e.target.value})} disabled={!repeatForm.semester_id || repeatSections.length === 0} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none disabled:opacity-50 focus:border-emerald-500 transition-colors">
                            <option value="">{repeatSections.length === 0 ? "Select Semester First" : "Select Section..."}</option>
                            {repeatSections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                    <button 
                        onClick={handleEnrollRepeat} 
                        disabled={isSubmitting || !repeatForm.reg_no || !repeatForm.subject_id} 
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={16} /> {isSubmitting ? "Enrolling..." : "Confirm Enrollment"}
                    </button>
                </div>
            </div>
        </div>
    );
};