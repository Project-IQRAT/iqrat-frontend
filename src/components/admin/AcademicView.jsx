import React from 'react';
import { ArrowLeft, Building, GraduationCap, BookOpen, Lock, Trash2, Layers, Users, MapPin, UserPlus, RefreshCcw, Calendar, FileSpreadsheet, FileText, Download, Clock, X } from 'lucide-react';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const AcademicView = ({
    currentToken, adminRoleLevel, setActiveTab, showToast,
    academicSubTab, setAcademicSubTab,
    departments, setDepartments, degreesList, setDegreesList,
    deptForm, setDeptForm, degreeForm, setDegreeForm, subjectForm, setSubjectForm,
    batchForm, setBatchForm, sectionForm, setSectionForm, classroomForm, setClassroomForm,
    offeringForm, setOfferingForm, timetableForm, setTimetableForm,
    allSubjects, setAllSubjects, allSemesters, setAllSemesters, allOfferings, setAllOfferings,
    allClassrooms, setAllClassrooms, allTimetables, setAllTimetables,
    timetableFilter, setTimetableFilter, ttDeptFilter, setTtDeptFilter, ttDeptDegrees,
    showTransferModal, setShowTransferModal, transferLecturerId, setTransferLecturerId,
    timeSlots, setTimeSlots, newSlotForm, setNewSlotForm,
    activeTerm, setActiveTerm,
    usersList, isSubmitting, setIsSubmitting,
    setShowExportModal, enrollSectionForm, setEnrollSectionForm,
    semesterSections, handleBatchEnroll
}) => {
    
    const lecturers = usersList.filter(u => (u.role || "").toLowerCase() === 'lecturer');

    // --- ACADEMIC & TIMETABLE API HANDLERS ---
    const handleCreateDept = async () => {
        if (!deptForm.name || !deptForm.code) return showToast("Fill all department fields.", "error");
        setIsSubmitting(true);
        try {
            const res = await fetch("${import.meta.env.VITE_API_URL}/api/v1/academic/departments", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` }, body: JSON.stringify({ name: deptForm.name, code: deptForm.code }) });
            if (res.ok) { 
                showToast("Department Created!", "success"); 
                setDeptForm({ name: "", code: "" });
                const deptRes = await fetch("${import.meta.env.VITE_API_URL}/api/v1/academic/departments", { headers: { "Authorization": `Bearer ${currentToken}` } });
                if (deptRes.ok) setDepartments(await deptRes.json());
            } 
            else { const err = await res.json(); showToast(`Error: ${err.detail}`, "error"); }
        } catch { showToast("Network Error", "error"); } finally { setIsSubmitting(false); }
    };

    const handleCreateDegree = async () => {
        if (!degreeForm.name || !degreeForm.code || !degreeForm.department_id) return showToast("Fill all degree fields.", "error");
        setIsSubmitting(true);
        try {
            const res = await fetch("${import.meta.env.VITE_API_URL}/api/v1/academic/degrees", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` }, body: JSON.stringify({ name: degreeForm.name, code: degreeForm.code, department_id: degreeForm.department_id }) });
            if (res.ok) { 
                showToast("Degree Program Created!", "success"); 
                setDegreeForm({ name: "", code: "", department_id: departments[0]?.id || "" });
                if (subjectForm.temp_dept_id) {
                    const degRes = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/degrees/${subjectForm.temp_dept_id}`, { headers: { "Authorization": `Bearer ${currentToken}` } });
                    if (degRes.ok) setDegreesList(await degRes.json());
                }
            } 
            else { const err = await res.json(); showToast(`Error: ${err.detail}`, "error"); }
        } catch { showToast("Network Error", "error"); } finally { setIsSubmitting(false); }
    };

    const handleCreateSubject = async () => {
        if (!subjectForm.name || !subjectForm.code || !subjectForm.degree_id) return showToast("Fill all subject fields.", "error");
        setIsSubmitting(true);
        try {
            const res = await fetch("${import.meta.env.VITE_API_URL}/api/v1/academic/subjects", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` }, body: JSON.stringify({ name: subjectForm.name, code: subjectForm.code, credit_hours: subjectForm.credit_hours, degree_id: subjectForm.degree_id, semester_no: subjectForm.semester_no }) });
            if (res.ok) { showToast("Course Created!", "success"); setSubjectForm({ ...subjectForm, name: "", code: "" }); } 
            else { const err = await res.json(); showToast(`Error: ${err.detail}`, "error"); }
        } catch { showToast("Network Error", "error"); } finally { setIsSubmitting(false); }
    };

    const handleCreateBatchAndSemesters = async () => {
        if (!batchForm.degree_id || !batchForm.start_year) return showToast("Please select a degree and start year.", "error");
        setIsSubmitting(true);
        try {
            const batchName = `${batchForm.start_year}-${batchForm.end_year}`;
            const batchRes = await fetch("${import.meta.env.VITE_API_URL}/api/v1/academic/batches", {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
                body: JSON.stringify({ degree_id: parseInt(batchForm.degree_id), name: batchName, start_year: parseInt(batchForm.start_year), end_year: parseInt(batchForm.end_year) })
            });

            if (batchRes.ok) {
                const newBatch = await batchRes.json();
                for (let i = 1; i <= 8; i++) {
                    await fetch("${import.meta.env.VITE_API_URL}/api/v1/academic/semesters", {
                        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
                        body: JSON.stringify({ session_id: newBatch.id, name: `Semester ${i} (${batchName})`, semester_no: i })
                    });
                }
                showToast(`Batch ${batchName} and its 8 Semesters auto-generated!`, "success");
                const semRes = await fetch("${import.meta.env.VITE_API_URL}/api/v1/academic/all-semesters", { headers: { "Authorization": `Bearer ${currentToken}` } });
                if (semRes.ok) setAllSemesters(await semRes.json());
            } else {
                const err = await batchRes.json(); showToast(`Error: ${err.detail}`, "error");
            }
        } catch { showToast("Network Error.", "error"); } finally { setIsSubmitting(false); }
    };

    const handleCreateSection = async () => {
        if (!sectionForm.semester_id || !sectionForm.name) return showToast("Please select a semester and enter a section name.", "error");
        setIsSubmitting(true);
        try {
            const res = await fetch("${import.meta.env.VITE_API_URL}/api/v1/academic/sections", {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
                body: JSON.stringify({ semester_id: parseInt(sectionForm.semester_id), name: sectionForm.name })
            });
            if (res.ok) {
                showToast("Class Section Created Successfully!", "success");
                setSectionForm({ semester_id: "", name: "" });
            } else {
                const err = await res.json(); showToast(`Error: ${err.detail}`, "error");
            }
        } catch { showToast("Network Error", "error"); } finally { setIsSubmitting(false); }
    };

    const handleCreateClassroom = async () => {
        if (!classroomForm.room_no || !classroomForm.department_id) return showToast("Please enter a room number and select a department.", "error");
        setIsSubmitting(true);
        try {
            const res = await fetch("${import.meta.env.VITE_API_URL}/api/v1/academic/classrooms", {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
                body: JSON.stringify(classroomForm)
            });
            if (res.ok) {
                showToast("Classroom Created Successfully!", "success");
                setClassroomForm(prev => ({ ...prev, room_no: "", building_name: "", capacity: 60, latitude: 31.5204, longitude: 74.3587 }));
                const classRes = await fetch("${import.meta.env.VITE_API_URL}/api/v1/academic/classrooms", { headers: { "Authorization": `Bearer ${currentToken}` } });
                if (classRes.ok) setAllClassrooms(await classRes.json());
            } else {
                const err = await res.json(); showToast(`Error: ${err.detail}`, "error");
            }
        } catch { showToast("Network Error", "error"); } finally { setIsSubmitting(false); }
    };

    const handleAssignLecturer = async () => {
        if (!offeringForm.semester_id || !offeringForm.subject_id || !offeringForm.lecturer_id) return showToast("Select a Semester, Subject, and Lecturer.", "error");
        setIsSubmitting(true);
        try {
            const res = await fetch("${import.meta.env.VITE_API_URL}/api/v1/academic/subject-offerings", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
                body: JSON.stringify({ semester_id: parseInt(offeringForm.semester_id), subject_id: parseInt(offeringForm.subject_id), lecturer_id: parseInt(offeringForm.lecturer_id) })
            });
            
            if (res.ok) { 
                showToast("Lecturer successfully assigned to course!", "success"); 
                setOfferingForm({ semester_id: "", subject_id: "", lecturer_id: "" }); 
            } else { 
                const err = await res.json(); 
                const errMsg = Array.isArray(err.detail) ? err.detail[0].msg : err.detail;
                showToast(`Error: ${errMsg}`, "error"); 
            }
        } catch { showToast("Network Error", "error"); } finally { setIsSubmitting(false); }
    };

    const handleScheduleClass = async () => {
        if (!timetableForm.offering_id || !timetableForm.classroom_id || !timetableForm.start_time || !timetableForm.end_time) return showToast("Please fill all timetable fields.", "error");
        setIsSubmitting(true);
        try {
            let s_time = timetableForm.start_time.length === 5 ? `${timetableForm.start_time}:00` : timetableForm.start_time;
            let e_time = timetableForm.end_time.length === 5 ? `${timetableForm.end_time}:00` : timetableForm.end_time;

            const res = await fetch("${import.meta.env.VITE_API_URL}/api/v1/academic/timetables", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
                body: JSON.stringify({
                    offering_id: parseInt(timetableForm.offering_id),
                    classroom_id: parseInt(timetableForm.classroom_id),
                    day_of_week: timetableForm.day_of_week,
                    start_time: s_time,
                    end_time: e_time
                })
            });
            if (res.ok) { 
                showToast("Class successfully added to Timetable!", "success"); 
                setTimetableForm({...timetableForm, start_time: "", end_time: ""}); 
                const ttRes = await fetch("${import.meta.env.VITE_API_URL}/api/v1/academic/all-timetables", { headers: { "Authorization": `Bearer ${currentToken}` } });
                if(ttRes.ok) setAllTimetables(await ttRes.json());
            }
            else { const err = await res.json(); showToast(`Error: ${err.detail}`, "error"); }
        } catch { showToast("Network Error", "error"); } finally { setIsSubmitting(false); }
    };

    const handleDeleteTimetable = async (id) => {
        if(!window.confirm("Remove this class from the timetable?")) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/timetables/${id}`, {
                method: "DELETE", headers: { "Authorization": `Bearer ${currentToken}` }
            });
            if(res.ok) {
                setAllTimetables(allTimetables.filter(t => t.id !== id));
                showToast("Timetable slot removed.", "success");
            } else {
                showToast("Failed to delete slot.", "error");
            }
        } catch(e) { console.error(e); }
    };

    const handleAddTimeSlot = () => {
        if (!newSlotForm.label || !newSlotForm.start || !newSlotForm.end) return showToast("Fill all fields.", "error");
        const formattedStart = newSlotForm.start.length === 5 ? newSlotForm.start + ":00" : newSlotForm.start;
        const formattedEnd = newSlotForm.end.length === 5 ? newSlotForm.end + ":00" : newSlotForm.end;
        setTimeSlots([...timeSlots, { label: newSlotForm.label, start: formattedStart, end: formattedEnd }].sort((a,b) => a.start.localeCompare(b.start)));
        setNewSlotForm({ label: "", start: "", end: "" });
        showToast("Time column added.", "success");
    };

    const handleRemoveTimeSlot = (idx) => {
        if(window.confirm("Delete this time slot? It will hide classes scheduled at this time from the grid.")) {
            setTimeSlots(timeSlots.filter((_, i) => i !== idx));
        }
    };

    const handleDeleteSubject = async (id) => {
        if (!window.confirm("Permanently delete this subject?")) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/subjects/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${currentToken}` } });
            if (res.ok) {
                setAllSubjects(prev => prev.filter(s => s.id !== id));
                showToast("Subject deleted.", "success");
            } else { 
                const err = await res.json(); 
                showToast(`Error: ${err.detail}`, "error"); 
            }
        } catch { showToast("Network Error", "error"); }
    };

    const handleTransferClass = async () => {
        if (!transferLecturerId) return showToast("Select a new lecturer first.", "error");
        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/subject-offerings/${showTransferModal}/transfer`, {
                method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
                body: JSON.stringify({ new_lecturer_id: parseInt(transferLecturerId) })
            });
            if (res.ok) {
                showToast("Class Transferred Successfully!", "success");
                setShowTransferModal(null);
                const offRes = await fetch("${import.meta.env.VITE_API_URL}/api/v1/academic/all-offerings", { headers: { "Authorization": `Bearer ${currentToken}` } });
                if (offRes.ok) setAllOfferings(await offRes.json());
            } else {
                showToast("Failed to transfer class.", "error");
            }
        } catch { showToast("Network Error", "error"); } finally { setIsSubmitting(false); }
    };

    const downloadTimetableCSV = () => {
        let csvContent = "Day," + timeSlots.map(ts => ts.label).join(",") + "\n";
        DAYS.forEach(day => {
            let row = [day];
            timeSlots.forEach(ts => {
                const normalizeTime = (t) => {
                    if (!t) return "";
                    const parts = t.split(":");
                    return `${parts[0].padStart(2, '0')}:${parts[1]}`;
                };

                const cellData = allTimetables.filter(t => {
                    if (t.day_of_week !== day) return false;
                    if (normalizeTime(t.start_time) !== normalizeTime(ts.start)) return false;
                    
                    const off = allOfferings.find(o => o.id === t.offering_id);
                    if (!off) return false;
                    
                    if (timetableFilter && off.semester_id.toString() !== timetableFilter.toString()) return false;
                    
                    if (ttDeptFilter) {
                        const sub = allSubjects.find(s => s.id === off.subject_id);
                        if (!sub) return false;
                        if (!ttDeptDegrees.some(d => d.id === sub.degree_id)) return false;
                    }
                    return true;
                });

                if (cellData.length > 0) {
                    const cellText = cellData.map(slot => {
                        const off = allOfferings.find(o => o.id === slot.offering_id);
                        const sub = off ? allSubjects.find(s => s.id === off.subject_id) : null;
                        const room = allClassrooms.find(c => c.id === slot.classroom_id);
                        const lec = off ? lecturers.find(l => l.profile_id === off.lecturer_id) : null;
                        return `${sub ? sub.name : 'Unknown'} [Room: ${room ? room.room_no : 'TBD'} | ${lec ? lec.name : 'TBD'}]`;
                    }).join("  AND  ");
                    row.push(`"${cellText}"`);
                } else {
                    row.push('""');
                }
            });
            csvContent += row.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "master_timetable.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Timetable CSV Downloaded", "success");
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
            <button onClick={() => setActiveTab('overview')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"><ArrowLeft size={16} /> Back to Dashboard</button>
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Academic Structure</h2>
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                    {adminRoleLevel !== 'super_admin' && (
                        <button onClick={() => setAcademicSubTab("timetable")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${academicSubTab === "timetable" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>Timetable & Assignments</button>
                    )}
                    <button onClick={() => setAcademicSubTab("structure")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${academicSubTab === "structure" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>Structure Setup</button>
                </div>
            </div>

            {academicSubTab === "structure" ? (
                <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
                    
                    {adminRoleLevel === 'super_admin' && (
                        <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 h-fit">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Building size={16} className="text-indigo-500"/> Add Department</h3>
                            <div className="space-y-4">
                                <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Dept Name</label><input type="text" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none" placeholder="e.g. Physics" /></div>
                                <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Dept Code</label><input type="text" value={deptForm.code} onChange={e => setDeptForm({...deptForm, code: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none" placeholder="e.g. PHY" /></div>
                                <button onClick={handleCreateDept} disabled={isSubmitting} className="w-full py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">{isSubmitting ? "Saving..." : "Create Department"}</button>
                            </div>
                        </div>
                    )}

                    <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 h-fit">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><GraduationCap size={16} className="text-emerald-500"/> Add Degree Program</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Parent Department</label>
                                <select value={degreeForm.department_id} onChange={e => setDegreeForm({...degreeForm, department_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                                    {departments.length > 0 ? departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>) : <option value="">Loading...</option>}
                                </select>
                            </div>
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Degree Name</label><input type="text" value={degreeForm.name} onChange={e => setDegreeForm({...degreeForm, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none" placeholder="e.g. BS Software Engineering" /></div>
                            <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Degree Code</label><input type="text" value={degreeForm.code} onChange={e => setDegreeForm({...degreeForm, code: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none" placeholder="e.g. BSSE" /></div>
                            <button onClick={handleCreateDegree} disabled={isSubmitting} className="w-full py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-xl hover:bg-emerald-600 hover:text-white transition-colors">{isSubmitting ? "Saving..." : "Create Degree"}</button>
                        </div>
                    </div>

                    {adminRoleLevel !== 'super_admin' && (
                        <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 h-fit row-span-2">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><BookOpen size={16} className="text-rose-500"/> Manage Subjects</h3>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Target Degree</label>
                                    <select value={subjectForm.degree_id} onChange={e => setSubjectForm({...subjectForm, degree_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                                        <option value="">Select Degree</option>
                                        {degreesList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1 flex items-center gap-2">Target Semester No <Lock size={10} className="text-rose-500"/></label>
                                    <select value={subjectForm.semester_no} onChange={e => setSubjectForm({...subjectForm, semester_no: parseInt(e.target.value)})} className="w-full bg-black border border-rose-500/30 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-rose-500 transition-colors">
                                        {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>Semester {num}</option>)}
                                    </select>
                                    <p className="text-[9px] text-slate-500 mt-1">This subject will ONLY appear in dropdowns for this specific semester number.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Subject Name</label><input type="text" value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none" placeholder="e.g. Calculus" /></div>
                                    <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Course Code</label><input type="text" value={subjectForm.code} onChange={e => setSubjectForm({...subjectForm, code: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none" placeholder="MATH-101" /></div>
                                </div>
                                <button onClick={handleCreateSubject} disabled={isSubmitting || !subjectForm.degree_id} className="w-full py-2 bg-rose-600/20 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-600 hover:text-white transition-colors disabled:opacity-50">Create Locked Course</button>
                            </div>
                            
                            <div className="border-t border-white/5 pt-4">
                                <p className="text-xs text-slate-500 font-bold uppercase mb-3">Existing Subjects</p>
                                <div className="max-h-40 overflow-y-auto space-y-2 scrollbar-hide">
                                    {allSubjects.map(sub => (
                                        <div key={sub.id} className="flex justify-between items-center p-2 bg-black/50 border border-white/5 rounded-lg group">
                                            <div>
                                                <p className="text-xs font-bold text-white leading-tight">{sub.code}</p>
                                                <p className="text-[9px] text-slate-500">Sem {sub.semester_no}</p>
                                            </div>
                                            <button onClick={() => handleDeleteSubject(sub.id)} className="text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 h-fit">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Layers size={16} className="text-amber-500"/> Add Session Batch</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Target Degree</label>
                                <select value={batchForm.degree_id} onChange={e => setBatchForm({...batchForm, degree_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                                    <option value="">Select Degree</option>
                                    {degreesList.length > 0 ? degreesList.map(d => <option key={d.id} value={d.id}>{d.name}</option>) : <option value="">No degrees found</option>}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Start Year</label><input type="number" value={batchForm.start_year} onChange={e => setBatchForm({...batchForm, start_year: e.target.value, end_year: parseInt(e.target.value) + 4})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none" /></div>
                                <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">End Year</label><input type="number" value={batchForm.end_year} readOnly className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-slate-400 text-sm outline-none cursor-not-allowed" /></div>
                            </div>
                            <button onClick={handleCreateBatchAndSemesters} disabled={isSubmitting || !batchForm.degree_id} className="w-full py-2 bg-amber-600/20 border border-amber-500/30 text-amber-400 font-bold text-xs rounded-xl hover:bg-amber-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? "Generating..." : "Auto-Generate 8 Semesters"}</button>
                        </div>
                    </div>

                    {adminRoleLevel !== 'super_admin' && (
                        <>
                            <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 h-fit">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Users size={16} className="text-indigo-500"/> Add Class Section</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Target Semester</label>
                                        <select value={sectionForm.semester_id} onChange={e => setSectionForm({...sectionForm, semester_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                                            <option value="">Select Semester</option>
                                            {allSemesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Section Name</label>
                                        <input type="text" value={sectionForm.name} onChange={e => setSectionForm({...sectionForm, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none" placeholder="e.g. CSA2, Section A" />
                                    </div>
                                    <button onClick={handleCreateSection} disabled={isSubmitting} className="w-full py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">{isSubmitting ? "Saving..." : "Create Section"}</button>
                                </div>
                            </div>

                            <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 h-fit">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><MapPin size={16} className="text-rose-500"/> Add Classroom</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Department</label>
                                        <select value={classroomForm?.department_id || ""} onChange={e => setClassroomForm({...classroomForm, department_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-rose-500">
                                            <option value="">Select Dept</option>
                                            {(departments || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Room No</label><input type="text" value={classroomForm.room_no} onChange={e => setClassroomForm({...classroomForm, room_no: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-rose-500 outline-none" placeholder="e.g. Room 101" /></div>
                                        <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Capacity</label><input type="number" value={classroomForm.capacity} onChange={e => setClassroomForm({...classroomForm, capacity: parseInt(e.target.value)})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-rose-500 outline-none" /></div>
                                    </div>
                                    <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Building Name</label><input type="text" value={classroomForm.building_name} onChange={e => setClassroomForm({...classroomForm, building_name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-rose-500 outline-none" placeholder="e.g. Main Block" /></div>
                                    <button onClick={handleCreateClassroom} disabled={isSubmitting || !classroomForm?.department_id} className="w-full py-2 bg-rose-600/20 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-600 hover:text-white transition-colors disabled:opacity-50">Create Classroom</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
                    
                    <div className="flex flex-col gap-6 h-fit">
                        <div className="flex bg-[#0c0c0e] border border-white/10 rounded-2xl p-1 w-full">
                            <button onClick={() => setActiveTerm("Odd")} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTerm === "Odd" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-white"}`}>Fall (1, 3, 5, 7)</button>
                            <button onClick={() => setActiveTerm("Even")} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTerm === "Even" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-white"}`}>Spring (2, 4, 6, 8)</button>
                        </div>

                        <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 relative">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2"><UserPlus size={16} className="text-indigo-500"/> Assign Lecturer</h3>
                                <button onClick={() => setShowTransferModal("list")} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-slate-400 hover:text-white transition-colors">Transfer Class</button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Semester</label>
                                    <select value={offeringForm.semester_id} onChange={(e) => setOfferingForm({...offeringForm, semester_id: e.target.value, subject_id: ''})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                                      <option value="">Select Semester</option>
                                      {allSemesters.filter(s => activeTerm === "Odd" ? s.semester_no % 2 !== 0 : s.semester_no % 2 === 0).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Subject (Locked to Selected Semester)</label>
                                    <select value={offeringForm.subject_id} onChange={(e) => setOfferingForm({...offeringForm, subject_id: e.target.value})} disabled={!offeringForm.semester_id} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none disabled:opacity-50">
                                        <option value="">Select Subject</option>
                                        {allSubjects.filter(s => {
                                            if(!offeringForm.semester_id) return true;
                                            const selectedSem = allSemesters.find(sem => sem.id === parseInt(offeringForm.semester_id));
                                            return selectedSem && s.semester_no === selectedSem.semester_no;
                                        }).map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Lecturer</label>
                                    <select value={offeringForm.lecturer_id} onChange={(e) => setOfferingForm({...offeringForm, lecturer_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                                        <option value="">Select Lecturer</option>
                                        {lecturers.map(l => <option key={l.id} value={l.profile_id}>{l.name}</option>)}
                                    </select>
                                </div>
                                <button onClick={handleAssignLecturer} disabled={isSubmitting} className="w-full py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">
                                    {isSubmitting ? "Processing..." : "Link Lecturer to Course"}
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 no-print">
                            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><Clock size={18} className="text-amber-500"/> Schedule Class</h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">1. Filter By Semester</label>
                                    <select value={timetableForm.semester_id || ""} onChange={(e) => setTimetableForm({...timetableForm, semester_id: e.target.value, offering_id: ""})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-amber-500 transition-colors">
                                        <option value="">All Semesters</option>
                                        {allSemesters.filter(s => activeTerm === "Odd" ? s.semester_no % 2 !== 0 : s.semester_no % 2 === 0).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">2. Select Course Offering</label>
                                    <select value={timetableForm.offering_id} onChange={(e) => setTimetableForm({...timetableForm, offering_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none disabled:opacity-50" disabled={!timetableForm.semester_id}>
                                        <option value="">Choose Class...</option>
                                        {allOfferings.filter(off => !timetableForm.semester_id || off.semester_id.toString() === timetableForm.semester_id.toString()).map(off => {
                                            const sub = allSubjects.find(s => s.id === off.subject_id);
                                            const lec = lecturers.find(l => l.profile_id === off.lecturer_id);
                                            return <option key={off.id} value={off.id}>{sub ? sub.name : 'Unknown'} - {lec ? lec.name : 'TBD'}</option>;
                                        })}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/5">
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Classroom</label>
                                        <select value={timetableForm.classroom_id} onChange={(e) => setTimetableForm({...timetableForm, classroom_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                                            <option value="">Select Room</option>
                                            {allClassrooms.map(c => <option key={c.id} value={c.id}>{c.room_no}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Day</label>
                                        <select value={timetableForm.day_of_week} onChange={(e) => setTimetableForm({...timetableForm, day_of_week: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                                            {DAYS.map(day => <option key={day}>{day}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Time Slot</label>
                                        <select onChange={(e) => {
                                            const slot = timeSlots[e.target.value];
                                            if(slot) setTimetableForm({...timetableForm, start_time: slot.start, end_time: slot.end});
                                        }} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-amber-500">
                                            <option value="">Select Time...</option>
                                            {timeSlots.map((ts, idx) => <option key={idx} value={idx}>{ts.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button onClick={handleScheduleClass} disabled={isSubmitting || !timetableForm.start_time} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg mt-4 disabled:opacity-50">
                                    {isSubmitting ? "Scheduling..." : "Add to Master Timetable"}
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Layers size={16} className="text-emerald-500"/> Batch Course Enrollment</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Semester</label>
                                    <select value={enrollSectionForm?.semester_id || ""} onChange={e => setEnrollSectionForm({...enrollSectionForm, semester_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                                        <option value="">Select Semester</option>
                                        {(allSemesters || [])
                                        .filter(s => activeTerm === "Odd" ? s.semester_no % 2 !== 0 : s.semester_no % 2 === 0)
                                        .map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                                        }
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Target Section</label>
                                    <select 
                                        value={enrollSectionForm?.section_id || ""} 
                                        onChange={e => setEnrollSectionForm({...enrollSectionForm, section_id: e.target.value})} 
                                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none disabled:opacity-50"
                                        disabled={!enrollSectionForm?.semester_id || (semesterSections || []).length === 0}
                                    >
                                        <option value="">
                                            {!enrollSectionForm?.semester_id 
                                                ? "Select Semester First" 
                                                : (semesterSections || []).length === 0 
                                                    ? "No Sections in this Semester" 
                                                    : "Select Section"}
                                        </option>
                                        {(semesterSections || []).map(sec => (
                                            <option key={sec.id} value={sec.id}>{sec.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Subject</label>
                                    <select value={enrollSectionForm?.subject_id || ""} onChange={e => setEnrollSectionForm({...enrollSectionForm, subject_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                                        <option value="">Select Subject</option>
                                        {(allSubjects || []).map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                    </select>
                                </div>
                                <button onClick={handleBatchEnroll} disabled={isSubmitting} className="w-full py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-xl hover:bg-emerald-600 hover:text-white transition-colors">
                                    {isSubmitting ? "Enrolling..." : "Enroll Entire Section"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 no-print">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Clock size={16} className="text-amber-500"/> Manage Master Time Columns</h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Start Time</label>
                                            <div className="flex gap-1 items-center">
                                                <select value={parseInt(newSlotForm.start.split(':')[0]) % 12 || 12} onChange={e => {
                                                    let h = parseInt(e.target.value);
                                                    const isPM = parseInt(newSlotForm.start.split(':')[0]) >= 12;
                                                    if (isPM && h < 12) h += 12;
                                                    if (!isPM && h === 12) h = 0;
                                                    setNewSlotForm({...newSlotForm, start: `${h.toString().padStart(2,'0')}:${newSlotForm.start.split(':')[1]}`});
                                                }} className="bg-black border border-white/10 rounded-xl px-2 py-2 text-white text-sm outline-none focus:border-amber-500 text-center flex-1 cursor-pointer">
                                                    {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                                                </select>
                                                <span className="text-white font-bold">:</span>
                                                <select value={newSlotForm.start.split(':')[1]} onChange={e => setNewSlotForm({...newSlotForm, start: `${newSlotForm.start.split(':')[0]}:${e.target.value}`})} className="bg-black border border-white/10 rounded-xl px-2 py-2 text-white text-sm outline-none focus:border-amber-500 text-center flex-1 cursor-pointer">
                                                    {['00','05','10','15','20','25','30','35','40','45','50','55'].map(min => <option key={min} value={min}>{min}</option>)}
                                                </select>
                                                <select value={parseInt(newSlotForm.start.split(':')[0]) >= 12 ? "PM" : "AM"} onChange={e => {
                                                    let h = parseInt(newSlotForm.start.split(':')[0]);
                                                    if (e.target.value === "PM" && h < 12) h += 12;
                                                    if (e.target.value === "AM" && h >= 12) h -= 12;
                                                    setNewSlotForm({...newSlotForm, start: `${h.toString().padStart(2,'0')}:${newSlotForm.start.split(':')[1]}`});
                                                }} className="bg-black border border-white/10 rounded-xl px-2 py-2 text-white text-sm outline-none focus:border-amber-500 text-center flex-1 cursor-pointer">
                                                    <option value="AM">AM</option>
                                                    <option value="PM">PM</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-bold block mb-1">End Time</label>
                                            <div className="flex gap-1 items-center">
                                                <select value={parseInt(newSlotForm.end.split(':')[0]) % 12 || 12} onChange={e => {
                                                    let h = parseInt(e.target.value);
                                                    const isPM = parseInt(newSlotForm.end.split(':')[0]) >= 12;
                                                    if (isPM && h < 12) h += 12;
                                                    if (!isPM && h === 12) h = 0;
                                                    setNewSlotForm({...newSlotForm, end: `${h.toString().padStart(2,'0')}:${newSlotForm.end.split(':')[1]}`});
                                                }} className="bg-black border border-white/10 rounded-xl px-2 py-2 text-white text-sm outline-none focus:border-amber-500 text-center flex-1 cursor-pointer">
                                                    {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                                                </select>
                                                <span className="text-white font-bold">:</span>
                                                <select value={newSlotForm.end.split(':')[1]} onChange={e => setNewSlotForm({...newSlotForm, end: `${newSlotForm.end.split(':')[0]}:${e.target.value}`})} className="bg-black border border-white/10 rounded-xl px-2 py-2 text-white text-sm outline-none focus:border-amber-500 text-center flex-1 cursor-pointer">
                                                    {['00','05','10','15','20','25','30','35','40','45','50','55'].map(min => <option key={min} value={min}>{min}</option>)}
                                                </select>
                                                <select value={parseInt(newSlotForm.end.split(':')[0]) >= 12 ? "PM" : "AM"} onChange={e => {
                                                    let h = parseInt(newSlotForm.end.split(':')[0]);
                                                    if (e.target.value === "PM" && h < 12) h += 12;
                                                    if (e.target.value === "AM" && h >= 12) h -= 12;
                                                    setNewSlotForm({...newSlotForm, end: `${h.toString().padStart(2,'0')}:${newSlotForm.end.split(':')[1]}`});
                                                }} className="bg-black border border-white/10 rounded-xl px-2 py-2 text-white text-sm outline-none focus:border-amber-500 text-center flex-1 cursor-pointer">
                                                    <option value="AM">AM</option>
                                                    <option value="PM">PM</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Display Label</label><input type="text" value={newSlotForm.label} onChange={e => setNewSlotForm({...newSlotForm, label: e.target.value})} placeholder="e.g. 8:00 - 9:30 AM" className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-amber-500" /></div>
                                    <button onClick={handleAddTimeSlot} className="w-full py-3 bg-amber-600/20 border border-amber-500/30 text-amber-400 font-bold text-xs rounded-xl hover:bg-amber-600 hover:text-white transition-colors">Add Column to Timetable</button>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Current Active Columns</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                                        {timeSlots.map((ts, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-xl text-sm transition-colors hover:bg-white/10">
                                                <span><strong className="text-white">{ts.label}</strong> <span className="text-xs text-slate-500 ml-2">({ts.start} to {ts.end})</span></span>
                                                <button onClick={() => handleRemoveTimeSlot(idx)} className="text-rose-500 hover:text-rose-400 p-1"><X size={16}/></button>
                                            </div>
                                        ))}
                                        {timeSlots.length === 0 && <p className="text-xs text-slate-500">No time slots defined.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 flex flex-col" id="printable-timetable">
                            <div className="flex flex-wrap justify-between items-center mb-6 no-print gap-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Calendar size={16} className="text-emerald-500"/> Master Timetable Visualizer</h3>
                                <div className="flex flex-wrap gap-2">
                                    {adminRoleLevel === 'super_admin' && (
                                        <select value={ttDeptFilter} onChange={e => setTtDeptFilter(e.target.value)} className="bg-black border border-indigo-500/50 rounded-lg px-3 py-1 text-xs text-indigo-400 font-bold outline-none cursor-pointer">
                                            <option value="">All Departments</option>
                                            {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
                                        </select>
                                    )}
                                    <select value={timetableFilter} onChange={e => setTimetableFilter(e.target.value)} className="bg-black border border-white/10 rounded-lg px-3 py-1 text-xs text-white outline-none cursor-pointer">
                                        <option value="">All Semesters</option>
                                        {allSemesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    
                                    <button onClick={downloadTimetableCSV} className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-4 py-1 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-2">
                                        <FileSpreadsheet size={14}/> CSV
                                    </button>
                                    <button onClick={() => setShowExportModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20">
                                        <FileText size={14}/> PDF Studio
                                    </button>
                                </div>
                            </div>
                            
                            <div className="border border-white/10 rounded-xl overflow-x-auto flex-1 bg-black/50 timetable-container">
                                <table className="w-full text-center border-collapse min-w-[700px]">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="border border-white/10 p-3 text-xs text-slate-400 font-bold uppercase w-16">Day</th>
                                            {timeSlots.map(ts => <th key={ts.start} className="border border-white/10 p-3 text-[10px] text-slate-400 font-bold uppercase">{ts.label}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {DAYS.map(day => (
                                            <tr key={day} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                                <td className="border-r border-white/10 p-2 text-xs font-bold text-white bg-white/5">{day.substring(0,2)}</td>
                                                {timeSlots.map(ts => {
                                                    const normalizeTime = (t) => {
                                                        if (!t) return "";
                                                        const parts = t.split(":");
                                                        return `${parts[0].padStart(2, '0')}:${parts[1]}`;
                                                    };

                                                    const cellData = allTimetables.filter(t => {
                                                        if (t.day_of_week !== day) return false;
                                                        if (normalizeTime(t.start_time) !== normalizeTime(ts.start)) return false;
                                                        
                                                        const off = allOfferings.find(o => o.id === t.offering_id);
                                                        if (!off) return false;
                                                        
                                                        if (timetableFilter && off.semester_id.toString() !== timetableFilter.toString()) return false;
                                                        
                                                        if (ttDeptFilter) {
                                                            const sub = allSubjects.find(s => s.id === off.subject_id);
                                                            if (!sub) return false;
                                                            if (!ttDeptDegrees.some(d => d.id === sub.degree_id)) return false;
                                                        }
                                                        return true;
                                                    });

                                                    return (
                                                        <td key={ts.start} className="border-r border-white/10 p-1.5 align-top w-[15%] h-24">
                                                            {cellData.map(slot => {
                                                                const off = allOfferings.find(o => o.id === slot.offering_id);
                                                                const sub = off ? allSubjects.find(s => s.id === off.subject_id) : null;
                                                                const room = allClassrooms.find(c => c.id === slot.classroom_id);
                                                                const lec = off ? lecturers.find(l => l.profile_id === off.lecturer_id) : null;
                                                                return (
                                                                    <div key={slot.id} className="tt-card bg-indigo-900/30 border border-indigo-500/30 rounded-lg p-2 mb-1.5 relative group text-left transition-all">
                                                                        <div className="text-[10px] font-bold text-white leading-tight mb-1">{sub ? sub.name : 'Unknown'}</div>
                                                                        <div className="flex justify-between items-center text-[9px]">
                                                                            <span className="bg-black/50 text-indigo-300 px-1.5 rounded">{room ? room.room_no : 'TBD'}</span>
                                                                            <span className="text-slate-400 truncate ml-1">{lec ? lec.name : 'TBD'}</span>
                                                                        </div>
                                                                        <button onClick={() => handleDeleteTimetable(slot.id)} className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 text-rose-500 hover:text-white bg-rose-900/80 hover:bg-rose-600 rounded-full p-0.5 no-print transition-all" title="Remove from schedule"><X size={12}/></button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-8 text-right pr-6 no-print">
                                    <p className="text-[10px] text-slate-400">Generated by IQRAT Secure Systems • {new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TRANSFER LECTURER MODAL */}
            {showTransferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#18181b] border border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><RefreshCcw size={20} className="text-amber-500"/> Transfer Classes</h3>
                            <button onClick={() => setShowTransferModal(null)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                        </div>
                        
                        {showTransferModal === "list" ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
                                {allOfferings.map(off => {
                                    const sub = allSubjects.find(s => s.id === off.subject_id);
                                    const lec = lecturers.find(l => l.profile_id === off.lecturer_id);
                                    return (
                                        <div key={off.id} className="flex justify-between items-center bg-black/40 border border-white/5 p-4 rounded-xl hover:bg-white/5 transition-colors">
                                            <div>
                                                <p className="text-sm font-bold text-white">{sub ? sub.name : 'Unknown Subject'}</p>
                                                <p className="text-xs text-slate-500">Currently: {lec ? lec.name : 'TBD'}</p>
                                            </div>
                                            <button onClick={() => setShowTransferModal(off.id)} className="px-4 py-2 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold hover:bg-amber-600 hover:text-white transition-colors">Transfer</button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                    <p className="text-xs text-amber-400 font-bold mb-2">Select New Lecturer</p>
                                    <select value={transferLecturerId} onChange={e => setTransferLecturerId(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500">
                                        <option value="">Choose Lecturer...</option>
                                        {lecturers.map(l => <option key={l.id} value={l.profile_id}>{l.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setShowTransferModal("list")} className="px-6 py-2 rounded-xl text-slate-400 hover:text-white text-sm font-bold">Back</button>
                                    <button onClick={handleTransferClass} disabled={isSubmitting || !transferLecturerId} className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold disabled:opacity-50">Confirm Transfer</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};