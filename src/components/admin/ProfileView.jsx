import React from 'react';
import { ArrowLeft, User, Shield } from 'lucide-react';

export const ProfileView = ({
    currentToken, decodedToken, setActiveTab, showToast,
    adminProfileData, setAdminProfileData,
    adminSecurity, setAdminSecurity,
    isSubmitting, setIsSubmitting
}) => {

    const handleUpdateAdminProfile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("current_email", decodedToken.sub); // Send the email from the token
        formData.append("full_name", adminProfileData.full_name);
        formData.append("new_email", adminProfileData.email);
        formData.append("contact_no", adminProfileData.contact_no);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/profile`, {
                method: "PUT", headers: { "Authorization": `Bearer ${currentToken}` }, body: formData
            });
            if (res.ok) showToast("Profile updated successfully!", "success");
            else showToast("Failed to update profile.", "error");
        } catch { showToast("Network Error", "error"); } finally { setIsSubmitting(false); }
    };

    const handleUpdateAdminPassword = async (e) => {
        e.preventDefault();
        if (adminSecurity.new_password !== adminSecurity.confirm_password) return showToast("New passwords do not match!", "error");
        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/password?email=${decodedToken.sub}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${currentToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({ current_password: adminSecurity.current_password, new_password: adminSecurity.new_password })
            });
            if (res.ok) {
                showToast("Password updated successfully.", "success");
                setAdminSecurity({ current_password: "", new_password: "", confirm_password: "" });
            } else {
                showToast("Incorrect current password.", "error");
            }
        } catch { showToast("Network Error", "error"); } finally { setIsSubmitting(false); }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setActiveTab('overview')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white">Admin Profile & Settings</h2>
                    <p className="text-xs text-slate-400 mt-1">Manage your account security and personal preferences.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* General Info */}
                <form onSubmit={handleUpdateAdminProfile} className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 shadow-xl h-fit">
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-4 flex items-center gap-2"><User size={20} className="text-indigo-400"/> Personal Details</h3>
                    <div className="space-y-4">
                        <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Full Name</label><input type="text" value={adminProfileData.full_name} onChange={e => setAdminProfileData({...adminProfileData, full_name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors" required /></div>
                        <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Email</label><input type="email" value={adminProfileData.email} onChange={e => setAdminProfileData({...adminProfileData, email: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors" required /></div>
                        <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Phone Number</label><input type="tel" value={adminProfileData.contact_no} onChange={e => setAdminProfileData({...adminProfileData, contact_no: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors" placeholder="+92..." /></div>
                        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg mt-2 disabled:opacity-50">{isSubmitting ? "Saving..." : "Update Profile"}</button>
                    </div>
                </form>

                {/* Security */}
                <form onSubmit={handleUpdateAdminPassword} className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 shadow-xl h-fit">
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-4 flex items-center gap-2"><Shield size={20} className="text-rose-400"/> Security</h3>
                    <div className="space-y-4">
                        <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Current Password</label><input type="password" value={adminSecurity.current_password} onChange={e => setAdminSecurity({...adminSecurity, current_password: e.target.value})} placeholder="••••••••" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition-colors" required /></div>
                        <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">New Password</label><input type="password" value={adminSecurity.new_password} onChange={e => setAdminSecurity({...adminSecurity, new_password: e.target.value})} placeholder="••••••••" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition-colors" required /></div>
                        <div><label className="text-xs text-slate-500 uppercase font-bold block mb-1">Confirm Password</label><input type="password" value={adminSecurity.confirm_password} onChange={e => setAdminSecurity({...adminSecurity, confirm_password: e.target.value})} placeholder="••••••••" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition-colors" required /></div>
                        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg mt-2 disabled:opacity-50">{isSubmitting ? "Updating..." : "Change Password"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};