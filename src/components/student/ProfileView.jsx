import React, { useState } from "react";
import { User, Settings, Shield, Camera, BellRing, Palette, Lock, CheckCircle, Smartphone, X } from "lucide-react";

export const ProfileView = ({
    profile,
    setProfile,
    userPhoto,
    setUserPhoto,
    fullProfileSettings,
    dashboardStats,
    currentToken,
    setActiveTab
}) => {
    const [settingsTab, setSettingsTab] = useState("general");
    
    // Form States
    const [editData, setEditData] = useState({
        full_name: fullProfileSettings?.full_name || "",
        email: fullProfileSettings?.email || "",
        contact_no: fullProfileSettings?.contact_no || "",
    });
    
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(userPhoto);

    const [preferences, setPreferences] = useState({
        theme_preference: fullProfileSettings?.theme_preference || "default",
        notify_class_reminders: fullProfileSettings?.notify_class_reminders ?? true,
        notify_assignment_deadlines: fullProfileSettings?.notify_assignment_deadlines ?? true,
    });

    const [security, setSecurity] = useState({ current_password: "", new_password: "", confirm_password: "" });
    const [toastMessage, setToastMessage] = useState("");

    // --- Device Request State ---
    const [showDeviceForm, setShowDeviceForm] = useState(false);
    const [deviceReason, setDeviceReason] = useState("");
    const [isRequestingDevice, setIsRequestingDevice] = useState(false);

    const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(""), 3000); };

    // File handler
    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
            setPhotoPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    // Submits General Info
    const handleSaveGeneral = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("current_email", profile.email);
        formData.append("full_name", editData.full_name);
        formData.append("new_email", editData.email);
        formData.append("contact_no", editData.contact_no);
        if (photoFile) formData.append("photo", photoFile);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/profile`, {
                method: "PUT", headers: { "Authorization": `Bearer ${currentToken}` }, body: formData
            });
            if (res.ok) {
                showToast("Profile details updated securely!");
                setProfile(prev => ({...prev, name: editData.full_name, email: editData.email}));
                // FIX: Instantly apply the new photo preview to the global Navbar Avatar
                if (photoFile) setUserPhoto(photoPreview); 
            }
            else showToast("Failed to update profile.");
        } catch (err) { console.error(err); }
    };

    // Submits Preferences
    const handleSavePreferences = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/settings?email=${profile.email}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${currentToken}`, "Content-Type": "application/json" },
                body: JSON.stringify(preferences)
            });
            if (res.ok) showToast("Settings saved! Theme will apply shortly.");
        } catch (err) { console.error(err); }
    };

    // Submits Security
    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (security.new_password !== security.confirm_password) {
            showToast("New passwords do not match!"); return;
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/password?email=${profile.email}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${currentToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({ current_password: security.current_password, new_password: security.new_password })
            });
            if (res.ok) {
                showToast("Password updated successfully.");
                setSecurity({ current_password: "", new_password: "", confirm_password: "" });
            } else showToast("Incorrect current password.");
        } catch (err) { console.error(err); }
    };

    // --- Submit Device Request ---
    const handleDeviceChangeRequest = async () => {
        if (!deviceReason.trim()) {
            showToast("Please provide a reason for the change.");
            return;
        }
        setIsRequestingDevice(true);
        
        // Grab the fingerprint of the CURRENT device they are using to make the request
        let currentFingerprint = localStorage.getItem("device_fingerprint");
        if (!currentFingerprint) {
            currentFingerprint = `device-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem("device_fingerprint", currentFingerprint);
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/device-request`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${currentToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    new_device_fingerprint: currentFingerprint,
                    reason: deviceReason
                })
            });
            const data = await res.json();
            
            if (res.ok) {
                showToast("Request sent to Admin successfully!");
                setShowDeviceForm(false);
                setDeviceReason("");
            } else {
                showToast(data.detail || "Failed to send request.");
            }
        } catch (err) {
            console.error(err);
            showToast("Network error. Could not send request.");
        } finally {
            setIsRequestingDevice(false);
        }
    };

    if (!fullProfileSettings) return <div className="text-center py-20 text-slate-500">Loading Profile...</div>;

    const userLevel = dashboardStats.level || 1;
    const isDarkGoldLocked = userLevel < 16;
    const isNeonLocked = userLevel < 50;

    return (
        <div className={`max-w-5xl mx-auto py-8 animate-fade-in pb-24 theme-${preferences.theme_preference}`}>
            
            {/* Header with Close Button */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Settings & Profile</h2>
                <button 
                    onClick={() => setActiveTab('home')} 
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Nav */}
                <div className="lg:col-span-3 space-y-2">
                    {[
                        { id: 'general', label: 'General', icon: User },
                        { id: 'preferences', label: 'Preferences', icon: Settings },
                        { id: 'security', label: 'Security', icon: Shield },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setSettingsTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm ${settingsTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right Content */}
                <div className="lg:col-span-9">
                    {toastMessage && (
                        <div className="mb-6 px-4 py-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center gap-3 text-emerald-400 text-sm animate-fade-in">
                            <CheckCircle size={18} /> {toastMessage}
                        </div>
                    )}

                    {settingsTab === 'general' && (
                        <form onSubmit={handleSaveGeneral} className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-8 space-y-8 shadow-xl">
                            <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4">Personal Information</h3>
                            
                            <div className="flex items-center gap-6">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-[#0c0c0e] shadow-2xl overflow-hidden">
                                        <img src={photoPreview} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt="Avatar" />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <Camera className="text-white" />
                                    </div>
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">{fullProfileSettings.full_name}</p>
                                    <p className="text-slate-400 text-xs font-mono mt-1">{fullProfileSettings.reg_no}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label><input type="text" value={editData.full_name} onChange={e=>setEditData({...editData, full_name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors" required /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label><input type="text" value={editData.contact_no} onChange={e=>setEditData({...editData, contact_no: e.target.value})} placeholder="+92 3XX XXXXXXX" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors" /></div>
                                <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center justify-between">Email Address <span className="text-[9px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded border border-amber-500/30">Verification Required</span></label><input type="email" value={editData.email} onChange={e=>setEditData({...editData, email: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors" required /></div>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-white/5"><button type="submit" className="bg-white text-black px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors">Save Profile</button></div>
                        </form>
                    )}

                    {settingsTab === 'preferences' && (
                        <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-8 space-y-8 shadow-xl">
                            <div>
                                <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4 mb-6 flex items-center gap-2"><BellRing size={20} className="text-indigo-400"/> Notifications</h3>
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between cursor-pointer bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
                                        <div>
                                            <p className="text-white font-bold text-sm">Class Reminders</p>
                                            <p className="text-slate-500 text-xs mt-1">Get notified 15 minutes before a lecture starts.</p>
                                        </div>
                                        <input type="checkbox" checked={preferences.notify_class_reminders} onChange={e=>setPreferences({...preferences, notify_class_reminders: e.target.checked})} className="w-5 h-5 accent-indigo-500 rounded bg-black border-white/10" />
                                    </label>
                                    <label className="flex items-center justify-between cursor-pointer bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
                                        <div>
                                            <p className="text-white font-bold text-sm">Assignment Deadlines</p>
                                            <p className="text-slate-500 text-xs mt-1">Get alerted when deadlines are approaching.</p>
                                        </div>
                                        <input type="checkbox" checked={preferences.notify_assignment_deadlines} onChange={e=>setPreferences({...preferences, notify_assignment_deadlines: e.target.checked})} className="w-5 h-5 accent-indigo-500 rounded bg-black border-white/10" />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4 mb-6 mt-8 flex items-center gap-2"><Palette size={20} className="text-purple-400"/> App Theme</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    
                                    <div onClick={() => setPreferences({...preferences, theme_preference: 'default'})} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${preferences.theme_preference === 'default' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-black/50 hover:border-white/30'}`}>
                                        <div className="w-full h-12 bg-black rounded-lg border border-white/10 mb-3 flex items-center justify-center text-indigo-500 font-bold">Aa</div>
                                        <p className="text-center text-sm font-bold text-white">Default Dark</p>
                                        <p className="text-center text-[10px] text-slate-500 mt-1">Unlocked</p>
                                    </div>

                                    <div onClick={() => !isDarkGoldLocked && setPreferences({...preferences, theme_preference: 'dark_gold'})} className={`p-4 rounded-2xl border-2 transition-all relative ${isDarkGoldLocked ? 'opacity-50 cursor-not-allowed border-white/5 bg-black' : preferences.theme_preference === 'dark_gold' ? 'border-amber-500 bg-amber-500/10 cursor-pointer' : 'border-white/10 bg-black/50 hover:border-amber-500/50 cursor-pointer'}`}>
                                        {isDarkGoldLocked && <div className="absolute top-2 right-2 bg-black/80 p-1 rounded"><Lock size={12} className="text-slate-400" /></div>}
                                        <div className="w-full h-12 bg-gradient-to-br from-black to-slate-900 rounded-lg border border-amber-500/30 mb-3 flex items-center justify-center text-amber-500 font-bold">Aa</div>
                                        <p className="text-center text-sm font-bold text-white">Dark Gold</p>
                                        <p className={`text-center text-[10px] mt-1 ${isDarkGoldLocked ? 'text-rose-400' : 'text-emerald-400'}`}>{isDarkGoldLocked ? "Requires Lvl 16" : "Unlocked"}</p>
                                    </div>

                                    <div onClick={() => !isNeonLocked && setPreferences({...preferences, theme_preference: 'neon_cyber'})} className={`p-4 rounded-2xl border-2 transition-all relative ${isNeonLocked ? 'opacity-50 cursor-not-allowed border-white/5 bg-black' : preferences.theme_preference === 'neon_cyber' ? 'border-teal-500 bg-teal-500/10 cursor-pointer' : 'border-white/10 bg-black/50 hover:border-teal-500/50 cursor-pointer'}`}>
                                        {isNeonLocked && <div className="absolute top-2 right-2 bg-black/80 p-1 rounded"><Lock size={12} className="text-slate-400" /></div>}
                                        <div className="w-full h-12 bg-black rounded-lg border border-teal-500/30 mb-3 flex items-center justify-center text-teal-400 font-bold shadow-[0_0_15px_rgba(45,212,191,0.2)]">Aa</div>
                                        <p className="text-center text-sm font-bold text-white">Neon Cyber</p>
                                        <p className={`text-center text-[10px] mt-1 ${isNeonLocked ? 'text-rose-400' : 'text-emerald-400'}`}>{isNeonLocked ? "Requires Lvl 50" : "Unlocked"}</p>
                                    </div>

                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-white/5"><button onClick={handleSavePreferences} className="bg-white text-black px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors">Apply Preferences</button></div>
                        </div>
                    )}

                    {settingsTab === 'security' && (
                        <div className="space-y-6">
                            <form onSubmit={handleSavePassword} className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-8 shadow-xl">
                                <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4 mb-6 flex items-center gap-2"><Shield size={20} className="text-rose-400"/> Change Password</h3>
                                <div className="space-y-4">
                                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Current Password</label><input type="password" value={security.current_password} onChange={e=>setSecurity({...security, current_password: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition-colors" required /></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Password</label><input type="password" value={security.new_password} onChange={e=>setSecurity({...security, new_password: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition-colors" required minLength="6" /></div>
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirm Password</label><input type="password" value={security.confirm_password} onChange={e=>setSecurity({...security, confirm_password: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition-colors" required minLength="6" /></div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-6 mt-6 border-t border-white/5"><button type="submit" className="bg-rose-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-rose-500 transition-colors">Update Password</button></div>
                            </form>

                            <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-8 shadow-xl">
                                <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4 mb-6 flex items-center gap-2"><Smartphone size={20} className="text-indigo-400"/> Linked Device</h3>
                                <div className="bg-black/50 border border-white/5 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-white font-bold text-sm">Primary Mobile Device</p>
                                        <p className="text-emerald-400 text-xs mt-1 font-mono flex items-center gap-1"><CheckCircle size={10}/> Active for scanning</p>
                                    </div>
                                    {!showDeviceForm ? (
                                        <button onClick={() => setShowDeviceForm(true)} className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors shrink-0">Request Change</button>
                                    ) : (
                                        <div className="flex-1 w-full sm:ml-4 animate-fade-in">
                                            <input 
                                                type="text" 
                                                placeholder="Reason (e.g., Lost old phone)" 
                                                value={deviceReason}
                                                onChange={(e) => setDeviceReason(e.target.value)}
                                                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 text-xs mb-2"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setShowDeviceForm(false)} className="text-[10px] font-bold text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-md transition-colors">Cancel</button>
                                                <button onClick={handleDeviceChangeRequest} disabled={isRequestingDevice} className="text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md transition-colors">{isRequestingDevice ? "Sending..." : "Submit to Admin"}</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};