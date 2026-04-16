import React from 'react';
import { ArrowLeft, UserPlus, Database, Search, MoreVertical, Edit, Trash2, X, Zap, UploadCloud, Calendar, Save } from 'lucide-react';

export const UsersView = ({
    currentToken,
    adminRoleLevel,
    setActiveTab,
    showToast,
    enrollMode, setEnrollMode,
    userRole, setUserRole,
    usersList, setUsersList,
    searchQuery, setSearchQuery,
    roleFilter, setRoleFilter,
    activeDropdown, setActiveDropdown,
    lecturerForm, setLecturerForm,
    studentForm, setStudentForm,
    adminForm, setAdminForm,
    AVAILABLE_TABS,
    studentDegrees,
    departments,
    allSemesters,
    studentFormSections,
    editingUser, setEditingUser,
    bulkForm, setBulkForm,
    bulkFile, setBulkFile,
    isSubmitting, setIsSubmitting
}) => {

    const filteredUsers = usersList.filter(user => {
        const nameMatch = (user.name || "").toLowerCase().includes(searchQuery.toLowerCase());
        const emailMatch = (user.email || "").toLowerCase().includes(searchQuery.toLowerCase());
        const roleMatch = roleFilter === "All Roles" || user.role === roleFilter;
        return (nameMatch || emailMatch) && roleMatch;
    });

    // --- Fetch sections specifically for the editing modal ---
    const [editSections, setEditSections] = React.useState([]);

    React.useEffect(() => {
        if (editingUser?.role === 'student' && editingUser?.semester_id) {
            fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/sections/${editingUser.semester_id}`, {
                headers: { "Authorization": `Bearer ${currentToken}` }
            })
            .then(res => res.json())
            .then(data => setEditSections(data))
            .catch(console.error);
        } else {
            setEditSections([]);
        }
    }, [editingUser?.semester_id, editingUser?.role, currentToken]);

    // --- HANDLERS (Moved here and using showToast) ---
    const handleGenerateRollNo = async () => {
        if (!studentForm.degree_id || !studentForm.batch_year) return showToast("Please select a Department, Degree, and Year below first.", "error");
        const selectedDegree = studentDegrees.find(d => d.id.toString() === studentForm.degree_id.toString());
        if (!selectedDegree) return;

        try {
            const safeDegreeCode = encodeURIComponent(selectedDegree.code);
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/next-roll-no?degree_code=${safeDegreeCode}&year=${studentForm.batch_year}`, {
                headers: { "Authorization": `Bearer ${currentToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                const isEven = data.numeric_id % 2 === 0;
                let prefix = studentForm.batch_type === "Morning" ? "A" : "E";
                let suffix = isEven ? "2" : "1";
                let degreePrefix = selectedDegree.code.replace("BS", "");
                let targetSectionName = `${degreePrefix}${prefix}${suffix}`;

                setStudentForm(prev => {
                    const newState = { ...prev, roll_no: data.next_roll_no, suggested_section: targetSectionName };
                    if (studentFormSections.length > 0) {
                        const match = studentFormSections.find(s => s.name.toUpperCase() === targetSectionName.toUpperCase());
                        if (match) newState.section_id = match.id;
                    }
                    return newState;
                });
                showToast(`Roll Number generated: ${data.next_roll_no}`, "success");
            } else {
                const errData = await res.json();
                showToast(`Failed to fetch roll number. Error: ${errData.detail || "Unknown Error"}`, "error");
            }
        } catch { showToast("Network error fetching ID.", "error"); }
    };

    const handleGenerateEmpId = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/next-emp-id`, { headers: { "Authorization": `Bearer ${currentToken}` } });
            if (res.ok) {
                const data = await res.json();
                setLecturerForm(prev => ({ ...prev, employee_code: data.next_emp_id }));
                showToast(`Employee ID generated: ${data.next_emp_id}`, "success");
            } else { showToast("Failed to fetch next Employee ID from server.", "error"); }
        } catch { showToast("Network error fetching ID.", "error"); }
    };

    const handleGenerateAdminId = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/next-admin-id`, { headers: { "Authorization": `Bearer ${currentToken}` } });
            if (res.ok) {
                const data = await res.json();
                setAdminForm(prev => ({ ...prev, admin_id: data.next_admin_id }));
                showToast(`Admin ID generated: ${data.next_admin_id}`, "success");
            } else { showToast("Failed to fetch next Admin ID.", "error"); }
        } catch { showToast("Network error fetching ID.", "error"); }
    };

    const handleCreateLecturer = async () => {
        if (!lecturerForm.full_name || !lecturerForm.email || !lecturerForm.password || !lecturerForm.employee_code || !lecturerForm.department_id) return showToast("Please fill all required fields.", "error");
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("full_name", lecturerForm.full_name); formData.append("email", lecturerForm.email);
            formData.append("employee_code", lecturerForm.employee_code); formData.append("department_id", lecturerForm.department_id);
            formData.append("password", lecturerForm.password);
            if (lecturerForm.contact_no) formData.append("contact_no", lecturerForm.contact_no);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/onboard/lecturer`, { method: "POST", headers: { "Authorization": `Bearer ${currentToken}` }, body: formData });
            const data = await response.json();
            if (response.ok) {
                showToast(`Success: ${data.msg}`, "success");
                setLecturerForm({ full_name: "", employee_code: "", email: "", password: "", department_id: departments[0]?.id || "", contact_no: "" });
            } else showToast(`Error: ${data.detail}`, "error");
        } catch { showToast("Network Error.", "error"); } finally { setIsSubmitting(false); }
    };

    const handleCreateAdmin = async () => {
        if (!adminForm.full_name || !adminForm.email || !adminForm.password || !adminForm.admin_id) return showToast("Please fill all required Admin fields.", "error");
        if (adminForm.role_level === "dept_admin" && !adminForm.department_id) return showToast("Department Admins must be assigned a department.", "error");

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("full_name", adminForm.full_name); formData.append("email", adminForm.email);
            formData.append("admin_id", adminForm.admin_id); formData.append("password", adminForm.password);
            formData.append("role_level", adminForm.role_level);
            if (adminForm.department_id) formData.append("department_id", adminForm.department_id);
            if (adminForm.contact_no) formData.append("contact_no", adminForm.contact_no);

            const permsToSend = adminForm.role_level === "super_admin" ? "ALL" : adminForm.permissions.join(",");
            formData.append("permissions", permsToSend);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/onboard/admin`, { method: "POST", headers: { "Authorization": `Bearer ${currentToken}` }, body: formData });
            const data = await response.json();
            if (response.ok) {
                showToast(`Success: ${data.msg}`, "success");
                setAdminForm({ full_name: "", admin_id: "", email: "", password: "", contact_no: "", role_level: "dept_admin", department_id: departments[0]?.id || "", permissions: [] });
            } else showToast(`Error: ${data.detail}`, "error");
        } catch { showToast("Network Error.", "error"); } finally { setIsSubmitting(false); }
    };

    const handleCreateStudent = async () => {
        if (!studentForm.full_name || !studentForm.email || !studentForm.password || !studentForm.roll_no || !studentForm.photo) return showToast("Please fill all fields, generate an ID, and select a photo.", "error");
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("full_name", studentForm.full_name); formData.append("email", studentForm.email);
            formData.append("roll_no", studentForm.roll_no);
            if (studentForm.degree_id) formData.append("degree_id", studentForm.degree_id);
            if (studentForm.section_id) formData.append("section_id", studentForm.section_id);
            formData.append("password", studentForm.password); formData.append("photo", studentForm.photo);
            if (studentForm.contact_no) formData.append("contact_no", studentForm.contact_no);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/onboard/student`, { method: "POST", headers: { "Authorization": `Bearer ${currentToken}` }, body: formData });
            const data = await response.json();
            if (response.ok) {
                showToast(`Success: ${data.msg}`, "success");
                setStudentForm({ full_name: "", roll_no: "", email: "", password: "", section_id: 1, section_name: "", department_id: departments[0]?.id || "", degree_id: studentDegrees[0]?.id || "", batch_type: "Morning", batch_year: "22", photo: null, contact_no: "" });
                if(document.getElementById('studentPhotoInput')) document.getElementById('studentPhotoInput').value = '';
            } else showToast(`Error: ${data.detail}`, "error");
        } catch { showToast("Network Error.", "error"); } finally { setIsSubmitting(false); }
    };

    const handleBulkUpload = async () => {
        if (!bulkFile) return showToast("Please select a CSV file.", "error");
        if (!bulkForm.department_id) return showToast("Please select a department.", "error");

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("file", bulkFile); formData.append("role", bulkForm.role); formData.append("department_id", bulkForm.department_id);

        if (bulkForm.role === 'Student') {
            if (!bulkForm.degree_id) { setIsSubmitting(false); return showToast("Please select a Degree for the students.", "error"); }
            formData.append("degree_id", bulkForm.degree_id); formData.append("batch_year", bulkForm.batch_year); formData.append("batch_type", bulkForm.batch_type);
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/onboard/bulk`, { method: "POST", headers: { "Authorization": `Bearer ${currentToken}` }, body: formData });
            const data = await res.json();
            if (res.ok) { showToast(data.msg, "success"); setBulkFile(null); } else showToast(`Error: ${data.detail}`, "error");
        } catch { showToast("Network error during upload.", "error"); } finally { setIsSubmitting(false); }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/${userId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${currentToken}` } });
            if (res.ok) { showToast("User deleted successfully!", "success"); setUsersList(usersList.filter(u => u.id !== userId)); }
            else { const data = await res.json(); showToast(`Error: ${data.detail}`, "error"); }
        } catch { showToast("Network Error.", "error"); }
        setActiveDropdown(null);
    };

    const handleEditUser = (user) => {
        setEditingUser({
            id: user.id, full_name: user.name, email: user.email, role: user.role.toLowerCase(),
            contact_no: user.contact_no || "", section_id: user.section_id || "", designation: user.designation || "",
            permissions: user.permissions ? user.permissions.split(',') : []
        });
        setActiveDropdown(null);
    };

    const togglePermission = (tabId) => {
        setAdminForm(prev => {
            const hasPerm = prev.permissions.includes(tabId);
            const newPerms = hasPerm ? prev.permissions.filter(p => p !== tabId) : [...prev.permissions, tabId];
            return { ...prev, permissions: newPerms };
        });
    };

    const toggleEditPermission = (tabId) => {
        setEditingUser(prev => {
            if (!prev) return prev;
            const currentPerms = prev.permissions || [];
            const newPerms = currentPerms.includes(tabId) ? currentPerms.filter(p => p !== tabId) : [...currentPerms, tabId];
            return { ...prev, permissions: newPerms };
        });
    };

    const handleSaveEdit = async () => {
        setIsSubmitting(true);
        try {
            const payload = { full_name: editingUser.full_name, email: editingUser.email };
            if (editingUser.contact_no) payload.contact_no = editingUser.contact_no;
            if (editingUser.role === 'student' && editingUser.section_id) payload.section_id = parseInt(editingUser.section_id);
            if (editingUser.role === 'lecturer' && editingUser.designation) payload.designation = editingUser.designation;
            if (editingUser.role === 'admin') payload.permissions = editingUser.permissions.join(',');

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/${editingUser.id}`, {
                method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` }, body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                showToast(data.msg, "success");
                setUsersList(usersList.map(u => u.id === editingUser.id ? { ...u, name: editingUser.full_name, email: editingUser.email } : u));
                setEditingUser(null);
            } else showToast(`Error: ${data.detail}`, "error");
        } catch { showToast("Network Error.", "error"); } finally { setIsSubmitting(false); }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in" onClick={() => activeDropdown && setActiveDropdown(null)}>
            <button onClick={() => setActiveTab('overview')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"><ArrowLeft size={16} /> Back to Dashboard</button>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Enrollment & User Management</h2>
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                    <button onClick={() => setEnrollMode("single")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${enrollMode === "single" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>Single Entry</button>
                    <button onClick={() => setEnrollMode("bulk")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${enrollMode === "bulk" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>Bulk Upload</button>
                </div>
            </div>

            <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-8 mb-8">
                {enrollMode === "single" ? (
                    <div className="animate-fade-in">
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Select Role</label>
                            <div className="flex gap-3">
                                {['Student', 'Lecturer', ...(adminRoleLevel === 'super_admin' ? ['Admin'] : [])].map(r => (
                                    <button key={r} onClick={() => setUserRole(r)} className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${userRole === r ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-black border-white/10 text-slate-500'}`}>{r}</button>
                                ))}
                            </div>
                        </div>

                        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><UserPlus size={18}/> {userRole} Registration Form</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Full Name</label>
                                <input type="text" value={userRole === 'Lecturer' ? lecturerForm.full_name : userRole === 'Student' ? studentForm.full_name : adminForm.full_name} onChange={e => { if(userRole === 'Lecturer') setLecturerForm({...lecturerForm, full_name: e.target.value}); if(userRole === 'Student') setStudentForm({...studentForm, full_name: e.target.value}); if(userRole === 'Admin') setAdminForm({...adminForm, full_name: e.target.value}); }} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" placeholder="Official Record Name" />
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold block mb-1">{userRole === 'Student' ? 'System ID / Roll No' : userRole === 'Lecturer' ? 'Employee ID' : 'Admin ID'}</label>
                                {userRole === 'Student' ? (
                                    <div className="flex gap-2">
                                        <input type="text" readOnly value={studentForm.roll_no} placeholder="Auto Generated" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-slate-400 outline-none cursor-not-allowed" />
                                        <button onClick={handleGenerateRollNo} type="button" title="Generate & Assign Section" className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg"><Zap size={20} /></button>
                                    </div>
                                ) : userRole === 'Lecturer' ? (
                                    <div className="flex gap-2">
                                        <input type="text" readOnly value={lecturerForm.employee_code} placeholder="Auto Generated" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-slate-400 outline-none cursor-not-allowed" />
                                        <button onClick={handleGenerateEmpId} type="button" title="Generate Employee ID" className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg"><Zap size={20} /></button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input type="text" readOnly value={adminForm.admin_id} placeholder="Auto Generated" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-slate-400 outline-none cursor-not-allowed" />
                                        <button onClick={handleGenerateAdminId} type="button" title="Generate Admin ID" className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg"><Zap size={20} /></button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Email</label>
                                <input type="email" value={userRole === 'Lecturer' ? lecturerForm.email : userRole === 'Student' ? studentForm.email : adminForm.email} onChange={e => { if(userRole === 'Lecturer') setLecturerForm({...lecturerForm, email: e.target.value}); if(userRole === 'Student') setStudentForm({...studentForm, email: e.target.value}); if(userRole === 'Admin') setAdminForm({...adminForm, email: e.target.value}); }} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" placeholder="name@iqrat.edu" required />
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Phone Number</label>
                                <input type="tel" value={userRole === 'Student' ? studentForm.contact_no : userRole === 'Lecturer' ? lecturerForm.contact_no : adminForm.contact_no} onChange={e => { if(userRole === 'Lecturer') setLecturerForm({...lecturerForm, contact_no: e.target.value}); if(userRole === 'Student') setStudentForm({...studentForm, contact_no: e.target.value}); if(userRole === 'Admin') setAdminForm({...adminForm, contact_no: e.target.value}); }} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" placeholder="+92 3XX XXXXXXX" />
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Temporary Password</label>
                                <input type="password" value={userRole === 'Lecturer' ? lecturerForm.password : userRole === 'Student' ? studentForm.password : adminForm.password} onChange={e => { if(userRole === 'Lecturer') setLecturerForm({...lecturerForm, password: e.target.value}); if(userRole === 'Student') setStudentForm({...studentForm, password: e.target.value}); if(userRole === 'Admin') setAdminForm({...adminForm, password: e.target.value}); }} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" placeholder="••••••••" />
                            </div>
                        </div>

                        {userRole === 'Student' && (
                            <div className="mb-6"><label className="text-xs text-slate-500 uppercase font-bold block mb-2">Admission Photo (Required for Facial Recognition)</label><input id="studentPhotoInput" type="file" accept="image/*" onChange={e => setStudentForm({...studentForm, photo: e.target.files[0]})} className="w-full bg-black/50 border border-dashed border-white/20 rounded-xl px-4 py-3 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer" /></div>
                        )}

                        <div className="border-t border-white/10 pt-6 mb-6">
                            <h4 className="text-slate-400 text-xs font-bold uppercase mb-4">Academic Mapping</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {userRole === 'Student' && (
                                    <>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Department</label>
                                            <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none" value={studentForm.department_id} onChange={e => setStudentForm({...studentForm, department_id: e.target.value, degree_id: "", section_name: "", roll_no: ""})}>
                                                <option value="">Select Dept</option>
                                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Degree</label>
                                            <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none disabled:opacity-50" disabled={!studentForm.department_id} value={studentForm.degree_id} onChange={e => setStudentForm({...studentForm, degree_id: e.target.value, section_name: "", roll_no: ""})}>
                                                <option value="">Select Degree</option>
                                                {studentDegrees.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Batch Timing</label>
                                            <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none" value={studentForm.batch_type} onChange={e => setStudentForm({...studentForm, batch_type: e.target.value, suggested_section: "", roll_no: ""})}>
                                                <option value="Morning">Morning</option>
                                                <option value="Evening">Evening</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Enroll Year</label>
                                            <div className="relative group">
                                                <input 
                                                    type="date" 
                                                    onChange={(e) => {
                                                        if(e.target.value) {
                                                            const year = new Date(e.target.value).getFullYear().toString().slice(-2);
                                                            setStudentForm({...studentForm, batch_year: year, suggested_section: "", roll_no: ""});
                                                        }
                                                    }} 
                                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                                    className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-indigo-500 outline-none text-sm cursor-pointer transition-colors"
                                                />
                                                <Calendar className="absolute left-4 top-3.5 text-indigo-400 pointer-events-none" size={18} />
                                                <div className="absolute right-4 top-3.5 text-xs text-slate-400 pointer-events-none">20{studentForm.batch_year}</div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5 mt-2">
                                            <div>
                                                <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Semester</label>
                                                <select value={studentForm.semester_id || ""} onChange={e => setStudentForm({...studentForm, semester_id: e.target.value, section_id: ""})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors">
                                                    <option value="">Select Semester...</option>
                                                    {allSemesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 uppercase font-bold block mb-1 flex justify-between items-center">
                                                    <span>Class Section</span>
                                                    {studentForm.suggested_section && <span className="text-[10px] text-indigo-400 normal-case bg-indigo-500/10 px-2 py-0.5 rounded">Auto-Target: {studentForm.suggested_section}</span>}
                                                </label>
                                                <select value={studentForm.section_id || ""} onChange={e => setStudentForm({...studentForm, section_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors" disabled={!studentForm.semester_id || studentFormSections.length === 0}>
                                                    <option value="">{studentFormSections.length === 0 ? "Select Semester First" : "Select Section..."}</option>
                                                    {studentFormSections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {userRole === 'Lecturer' && (
                                    <>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Department</label>
                                            <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none" value={lecturerForm.department_id} onChange={e => setLecturerForm({...lecturerForm, department_id: e.target.value})}>
                                                {departments.length > 0 ? departments.map(dept => (<option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>)) : (<option value="">Loading Departments...</option>)}
                                            </select>
                                        </div>
                                        <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Designation</label><select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none"><option>Lecturer</option><option>Assistant Professor</option><option>Professor</option></select></div>
                                    </>
                                )}
                                {userRole === 'Admin' && (
                                    <>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Admin Level</label>
                                            <select value={adminForm.role_level} onChange={e => setAdminForm({...adminForm, role_level: e.target.value, permissions: e.target.value === 'super_admin' ? AVAILABLE_TABS.map(t=>t.id) : []})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                                                <option value="dept_admin">Department Admin</option>
                                                <option value="super_admin">Super Admin</option>
                                            </select>
                                        </div>
                                        {adminForm.role_level === 'dept_admin' && (
                                            <div>
                                                <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Department Scope</label>
                                                <select value={adminForm.department_id} onChange={e => setAdminForm({...adminForm, department_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                                                    <option value="">Select Dept</option>
                                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        <div className="md:col-span-2">
                                            <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Permissions (Visible Tabs)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {AVAILABLE_TABS.map(tab => {
                                                    const isSelected = adminForm.role_level === 'super_admin' || adminForm.permissions.includes(tab.id);
                                                    return (
                                                        <button 
                                                            key={tab.id} type="button"
                                                            onClick={() => adminForm.role_level !== 'super_admin' && togglePermission(tab.id)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isSelected ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-black border-white/10 text-slate-500 hover:border-white/30'} ${adminForm.role_level === 'super_admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            {tab.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {adminForm.role_level === 'super_admin' && <p className="text-[10px] text-slate-500 mt-2">Super Admins automatically have all permissions globally.</p>}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button className="px-6 py-3 rounded-xl text-slate-400 font-bold text-sm hover:text-white transition-colors">Cancel</button>
                            <button onClick={() => { if (userRole === 'Lecturer') handleCreateLecturer(); if (userRole === 'Student') handleCreateStudent(); if (userRole === 'Admin') handleCreateAdmin(); }} disabled={isSubmitting} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2"><Save size={16} /> {isSubmitting ? "Creating..." : "Create Account"}</button>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in space-y-6">
                        <h3 className="text-white font-bold flex items-center gap-2 mb-4"><Database size={18}/> Bulk Enrolment Configuration</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target Role</label>
                                <select value={bulkForm.role} onChange={e => setBulkForm({...bulkForm, role: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                                    <option value="Student">Students</option>
                                    <option value="Lecturer">Lecturers</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target Department</label>
                                <select value={bulkForm.department_id} onChange={e => {
                                    setBulkForm({...bulkForm, department_id: e.target.value});
                                    setStudentForm({...studentForm, department_id: e.target.value}); 
                                }} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                                    <option value="">Select Dept...</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {bulkForm.role === 'Student' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/10">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Degree</label>
                                    <select value={bulkForm.degree_id} onChange={e => setBulkForm({...bulkForm, degree_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                                        <option value="">Select Degree...</option>
                                        {studentDegrees.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Timing</label>
                                    <select value={bulkForm.batch_type} onChange={e => setBulkForm({...bulkForm, batch_type: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                                        <option value="Morning">Morning</option>
                                        <option value="Evening">Evening</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Enrollment Year</label>
                                    <div className="relative group">
                                        <input 
                                            type="date" 
                                            onChange={(e) => {
                                                if(e.target.value) {
                                                    const year = new Date(e.target.value).getFullYear();
                                                    setBulkForm({...bulkForm, batch_year: year});
                                                }
                                            }} 
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                            className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-indigo-500 outline-none text-sm cursor-pointer transition-colors"
                                        />
                                        <Calendar className="absolute left-4 top-3.5 text-indigo-400 pointer-events-none" size={18} />
                                        <div className="absolute right-4 top-3.5 text-xs text-slate-400 pointer-events-none">Selected: {bulkForm.batch_year}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FILE UPLOAD BOX */}
                        <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-indigo-500/50 transition-colors bg-white/5 relative group mt-6">
                            <input 
                                type="file" 
                                accept=".csv" 
                                onChange={(e) => setBulkFile(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            />
                            <div className="text-center pointer-events-none">
                                <UploadCloud className={`mx-auto mb-4 transition-all ${bulkFile ? 'text-indigo-500 scale-110' : 'text-slate-500'}`} size={40} />
                                <h3 className="text-sm font-bold text-white mb-1">{bulkFile ? bulkFile.name : "Click or Drag CSV here"}</h3>
                                <p className="text-slate-400 text-xs">
                                    {bulkForm.role === 'Student' ? "CSV requires: full_name, email, roll_no" : "CSV requires: full_name, email, employee_code"}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button onClick={handleBulkUpload} disabled={isSubmitting || !bulkFile} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <Save size={16} /> {isSubmitting ? "Uploading..." : "Upload & Enroll Users"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl overflow-visible shadow-xl mb-32">
                <div className="p-4 border-b border-white/10 bg-white/5 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                        <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:border-indigo-500 outline-none" />
                    </div>
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-black border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none">
                        <option>All Roles</option><option>Student</option><option>Lecturer</option><option>Admin</option>
                    </select>
                </div>
                <div className="overflow-visible min-h-[300px]">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-xs uppercase bg-black/40 text-slate-300 font-bold border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-4 py-4">System ID</th>
                                <th className="px-4 py-4">Role</th>
                                <th className="px-4 py-4">Email</th>
                                <th className="px-4 py-4">Status</th>
                                <th className="px-4 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 relative">
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-white">{user.name}</td>
                                    <td className="px-4 py-4 font-mono text-indigo-400">{user.system_id || "N/A"}</td>
                                    <td className="px-4 py-4"><span className="px-2 py-0.5 rounded text-[10px] border border-white/10">{user.role}</span></td>
                                    <td className="px-4 py-4">{user.email}</td>
                                    <td className="px-4 py-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.status === 'Active' ? 'text-emerald-400' : 'text-rose-400'}`}>{user.status}</span></td>
                                    <td className="px-4 py-4 text-right relative">
                                        <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === user.id ? null : user.id); }} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"><MoreVertical size={16} /></button>
                                        {activeDropdown === user.id && (
                                            <div className="absolute right-12 top-1/2 -translate-y-1/2 w-36 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden text-left animate-fade-in">
                                                <button onClick={() => handleEditUser(user)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"><Edit size={14} /> Edit User</button>
                                                <button onClick={() => handleDeleteUser(user.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-white/5"><Trash2 size={14} /> Delete User</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="text-center py-6 text-slate-500">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* ADVANCED EDIT USER MODAL */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#18181b] border border-white/10 rounded-3xl w-full max-w-4xl p-8 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto scrollbar-hide">
                        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                                <p className="text-xs text-indigo-400 uppercase tracking-wider mt-1">{editingUser.role}</p>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-xl transition-colors hover:bg-white/10"><X size={20}/></button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Name</label><input type="text" value={editingUser.full_name} onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none" /></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email Address</label><input type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none" /></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Contact No (Optional)</label><input type="text" value={editingUser.contact_no} onChange={(e) => setEditingUser({...editingUser, contact_no: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none" /></div>
                            </div>

                            <div className="space-y-4">
                                {editingUser.role === 'student' && (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">1. Select Target Semester</label>
                                            <select value={editingUser.semester_id || ""} onChange={(e) => setEditingUser({...editingUser, semester_id: e.target.value, section_id: ""})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none">
                                                <option value="">Select Semester to load sections...</option>
                                                {(allSemesters || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">2. Transfer Section</label>
                                            <select value={editingUser.section_id || ""} onChange={(e) => setEditingUser({...editingUser, section_id: e.target.value})} disabled={!editingUser.semester_id} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none disabled:opacity-50">
                                                <option value="">Keep Current Section</option>
                                                {editSections.length > 0 ? (
                                                    editSections.map(sec => (
                                                        <option key={sec.id} value={sec.id}>{sec.name}</option>
                                                    ))
                                                ) : (
                                                    <option disabled>{!editingUser.semester_id ? "Select a semester first" : "No sections found in DB"}</option>
                                                )}
                                            </select>
                                        </div>
                                    </>
                                )}
                                
                                {editingUser.role === 'lecturer' && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Designation</label>
                                        <select value={editingUser.designation} onChange={(e) => setEditingUser({...editingUser, designation: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none">
                                            <option value="Lecturer">Lecturer</option>
                                            <option value="Assistant Professor">Assistant Professor</option>
                                            <option value="Professor">Professor</option>
                                        </select>
                                    </div>
                                )}

                                {editingUser.role === 'admin' && adminRoleLevel === 'super_admin' && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Edit Tab Permissions</label>
                                        <div className="flex flex-wrap gap-2 p-3 bg-black/40 border border-white/5 rounded-xl">
                                            {AVAILABLE_TABS.map(tab => {
                                                const isSuper = editingUser.permissions && editingUser.permissions.includes('ALL');
                                                const isSelected = isSuper || (editingUser.permissions && editingUser.permissions.includes(tab.id));
                                                return (
                                                    <button 
                                                        key={tab.id} type="button"
                                                        onClick={() => !isSuper && toggleEditPermission(tab.id)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isSelected ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-black border-white/10 text-slate-500 hover:border-white/30'} ${isSuper ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {tab.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                            <button onClick={handleSaveEdit} disabled={isSubmitting} className="px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20 active:scale-95">
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};