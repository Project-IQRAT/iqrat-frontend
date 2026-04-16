import React from "react";
import { Users, GraduationCap, BookOpen, Building, Layers, Activity, XCircle, AlertTriangle, UserPlus, Calendar, Smartphone, MessageSquare } from "lucide-react";

// The StatCard is now local to the Overview Tab to keep things modular
const StatCard = ({ title, value, sub, icon: Icon, color, isAlert }) => (
    <div className={`p-6 rounded-3xl border relative overflow-hidden group transition-all hover:scale-[1.02] ${isAlert ? 'bg-rose-900/10 border-rose-500/30 animate-pulse-red' : 'bg-[#0c0c0e] border-white/10 hover:border-white/20'}`}>
        <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}><Icon size={64} /></div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest z-10 relative">{title}</p>
        <div className="flex items-baseline gap-2 mt-2 z-10 relative">
            <span className={`text-3xl font-bold ${color}`}>{value}</span>
            {sub && <span className="text-xs text-slate-400">{sub}</span>}
        </div>
    </div>
);

export const OverviewTab = ({ 
    usersList, 
    departments, 
    studentDegrees, 
    systemAlerts, 
    adminRoleLevel, 
    setActiveTab, 
    showToast 
}) => {
    // Dynamically calculate stats
    const studentCount = usersList.filter(u => (u.role || "").toLowerCase() === 'student').length;
    const lecturerCount = usersList.filter(u => (u.role || "").toLowerCase() === 'lecturer').length;

    const handleResolveAlert = (alertId) => {
        // In a real app, this would hit an API. For now, we'll just show the beautiful new toast!
        showToast("Alert resolved successfully.", "success");
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Users" value={usersList.length} sub="Registered Accounts" icon={Users} color="text-indigo-400" />
                <StatCard title="Total Students" value={studentCount} sub="Enrolled Students" icon={GraduationCap} color="text-emerald-400" />
                <StatCard title="Total Lecturers" value={lecturerCount} sub="Faculty Members" icon={BookOpen} color="text-blue-400" />
                
                {/* DYNAMIC 4TH CARD */}
                {adminRoleLevel === 'super_admin' ? (
                    <StatCard title="Departments" value={departments.length} sub="Academic Faculties" icon={Building} color="text-rose-500" />
                ) : (
                    <StatCard title="Total Degrees" value={studentDegrees.length} sub="In My Department" icon={Layers} color="text-emerald-500" />
                )}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 shadow-lg">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Activity size={18} className="text-rose-500" /> System Health & Alerts</h3>
                    <div className="space-y-3">
                        {systemAlerts.length === 0 ? (
                            <div className="text-center text-slate-500 text-xs py-10 italic">System is currently nominal. No active alerts.</div>
                        ) : (
                            systemAlerts.map(alert => (
                                <div key={alert.id} className={`p-4 rounded-xl border flex items-center gap-4 ${alert.type === 'critical' ? 'bg-rose-900/10 border-rose-500/20' : 'bg-amber-900/10 border-amber-500/20'}`}>
                                    {alert.type === 'critical' ? <XCircle className="text-rose-500 shrink-0" /> : <AlertTriangle className="text-amber-500 shrink-0" />}
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white">{alert.msg}</p>
                                        <p className="text-xs text-slate-500">{alert.time}</p>
                                    </div>
                                    <button onClick={() => handleResolveAlert(alert.id)} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white border border-white/5 transition-colors">Resolve</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 shadow-lg">
                    <h3 className="text-sm font-bold text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setActiveTab('users')} className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-300 text-sm font-bold hover:bg-indigo-600/20 transition-colors flex flex-col items-center gap-2 shadow-inner"><UserPlus size={24} /> Enroll User</button>
                        <button onClick={() => setActiveTab('academics')} className="p-4 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm font-bold hover:bg-white/10 transition-colors flex flex-col items-center gap-2 shadow-inner"><Calendar size={24} /> Edit Timetable</button>
                        <button onClick={() => setActiveTab('security')} className="p-4 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm font-bold hover:bg-white/10 transition-colors flex flex-col items-center gap-2 shadow-inner"><Smartphone size={24} /> Verify Devices</button>
                        <button onClick={() => setActiveTab('communication')} className="p-4 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm font-bold hover:bg-white/10 transition-colors flex flex-col items-center gap-2 shadow-inner"><MessageSquare size={24} /> Broadcast</button>
                    </div>
                </div>
            </div>
        </div>
    );
};