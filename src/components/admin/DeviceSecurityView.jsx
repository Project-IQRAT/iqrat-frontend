import React from 'react';
import { ArrowLeft, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export const DeviceSecurityView = ({
    currentToken, setActiveTab, showToast,
    deviceRequests, setDeviceRequests, isLoadingDevices
}) => {

    const handleApproveDevice = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/device-requests/${id}/approve`, {
                method: "POST", headers: { "Authorization": `Bearer ${currentToken}` }
            });
            if (res.ok) {
                setDeviceRequests(prev => prev.filter(r => r.id !== id));
                showToast("Device approved and old devices revoked.", "success");
            } else {
                showToast("Failed to approve device.", "error");
            }
        } catch { showToast("Network Error", "error"); }
    };

    const handleRejectDevice = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/device-requests/${id}/reject`, {
                method: "POST", headers: { "Authorization": `Bearer ${currentToken}` }
            });
            if (res.ok) {
                setDeviceRequests(prev => prev.filter(r => r.id !== id));
                showToast("Device request rejected.", "success");
            } else {
                showToast("Failed to reject request.", "error");
            }
        } catch { showToast("Network Error", "error"); }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
            <button onClick={() => setActiveTab('overview')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"><ArrowLeft size={16} /> Back to Dashboard</button>
            <h2 className="text-2xl font-bold text-white mb-6">Device Verification & Security</h2>
            
            <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Pending Reset Requests</h3>
                    <div className="text-xs text-slate-400">Strict One-Device Policy</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-black/40 text-slate-500 font-bold border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-4 py-4">Role</th>
                                <th className="px-4 py-4">Requested Device</th>
                                <th className="px-4 py-4">Reason</th>
                                <th className="px-4 py-4">Date</th>
                                <th className="px-4 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoadingDevices ? (
                                <tr><td colSpan="6" className="text-center py-8 text-slate-500 animate-pulse">Loading secure requests...</td></tr>
                            ) : deviceRequests.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-slate-500">No pending device change requests.</td></tr>
                            ) : (
                                deviceRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-white">{req.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{req.id_no}</p>
                                        </td>
                                        <td className="px-4 py-4"><span className="px-2 py-0.5 border border-white/10 rounded text-xs">{req.role}</span></td>
                                        <td className="px-4 py-4 text-white font-mono">{req.device}</td>
                                        <td className="px-4 py-4">{req.reason}</td>
                                        <td className="px-4 py-4 text-xs">{req.date}</td>
                                        <td className="px-4 py-4 text-right flex justify-end gap-2">
                                            <button onClick={() => handleApproveDevice(req.id)} className="p-2 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 rounded-lg transition-colors border border-emerald-500/20" title="Approve & Reset"><CheckCircle size={18} /></button>
                                            <button onClick={() => handleRejectDevice(req.id)} className="p-2 bg-rose-600/10 text-rose-400 hover:bg-rose-600/20 rounded-lg transition-colors border border-rose-500/20" title="Reject"><XCircle size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};