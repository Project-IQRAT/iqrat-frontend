import React from 'react';
import { ArrowLeft, Send, Megaphone, History, Bell, Users } from 'lucide-react';

export const CommunicationView = ({
    currentToken, setActiveTab, showToast,
    departments, commHistory, setCommHistory,
    commForm, setCommForm, isSendingBroadcast, setIsSendingBroadcast
}) => {

    const handleBroadcast = async () => {
        if (!commForm.title || !commForm.body) return showToast("Title and Message are required!", "error");
        if (commForm.target === "specific" && !commForm.specificId) return showToast("Enter a Roll Number or Employee ID!", "error");
        if (commForm.target === "dept" && !commForm.specificId) return showToast("Select a department!", "error");

        setIsSendingBroadcast(true);
        try {
            const res = await fetch("${import.meta.env.VITE_API_URL}/api/v1/system/communication/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
                body: JSON.stringify(commForm)
            });
            const data = await res.json();
            if (res.ok) {
                showToast(data.msg, "success");
                setCommForm({ target: "all", specificId: "", title: "", body: "", email: true, push: true });
                const histRes = await fetch("${import.meta.env.VITE_API_URL}/api/v1/system/communication/history", { headers: { "Authorization": `Bearer ${currentToken}` } });
                if (histRes.ok) setCommHistory(await histRes.json());
            } else {
                showToast(`Error: ${data.detail}`, "error");
            }
        } catch { showToast("Network Error.", "error"); } finally { setIsSendingBroadcast(false); }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setActiveTab('overview')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white">Communication Center</h2>
                    <p className="text-xs text-slate-400 mt-1">Send official system broadcasts and alerts.</p>
                </div>
            </div>
            
            <div className="grid lg:grid-cols-[3fr,2fr] gap-8">
                {/* COMPOSE CARD */}
                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-8 shadow-xl flex flex-col h-fit">
                    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><Send size={16} className="text-indigo-400"/> Compose Broadcast</h3>
                    
                    <div className="space-y-6">
                        {/* Interactive Audience Selector */}
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold block mb-3">Target Audience</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'all', label: 'Everyone' },
                                    { id: 'students', label: 'All Students' },
                                    { id: 'lecturers', label: 'All Lecturers' },
                                    { id: 'dept', label: 'By Department' },
                                    { id: 'specific', label: 'Specific User' }
                                ].map(aud => (
                                    <button 
                                        key={aud.id} 
                                        onClick={() => setCommForm({...commForm, target: aud.id, specificId: ""})} 
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${commForm.target === aud.id ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30 shadow-lg' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {aud.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Input based on Audience */}
                        <div className="h-12 flex items-end animate-fade-in">
                            {commForm.target === 'dept' && (
                                <div className="w-full">
                                    <label className="text-xs text-indigo-400 uppercase font-bold block mb-2">Select Department</label>
                                    <select value={commForm.specificId} onChange={(e) => setCommForm({...commForm, specificId: e.target.value})} className="w-full bg-indigo-950/20 border border-indigo-500/30 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500">
                                        <option value="">Select Dept...</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                            )}
                            {commForm.target === 'specific' && (
                                <div className="w-full">
                                    <label className="text-xs text-indigo-400 uppercase font-bold block mb-2">User System ID</label>
                                    <input type="text" value={commForm.specificId} onChange={(e) => setCommForm({...commForm, specificId: e.target.value})} placeholder="e.g. 0122-BSCS-22 or EMP-001" className="w-full bg-indigo-950/20 border border-indigo-500/30 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500" />
                                </div>
                            )}
                            {commForm.target !== 'dept' && commForm.target !== 'specific' && (
                                <p className="text-xs text-slate-500 italic pb-2">This message will be sent to all users in the selected category.</p>
                            )}
                        </div>

                        {/* Message Inputs */}
                        <div className="pt-4 border-t border-white/5">
                            <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Message Title</label>
                            <input type="text" value={commForm.title} onChange={(e) => setCommForm({...commForm, title: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Emergency Campus Closure" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Message Body</label>
                            <textarea rows="5" value={commForm.body} onChange={(e) => setCommForm({...commForm, body: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none focus:border-indigo-500 transition-colors" placeholder="Type your official announcement here..."></textarea>
                        </div>
                        
                        {/* Footer Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5 mt-4">
                            <div className="flex items-center gap-6 w-full sm:w-auto">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" checked={commForm.email} onChange={e=>setCommForm({...commForm, email: e.target.checked})} className="accent-indigo-500 w-4 h-4 cursor-pointer" />
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">Email</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" checked={commForm.push} onChange={e=>setCommForm({...commForm, push: e.target.checked})} className="accent-indigo-500 w-4 h-4 cursor-pointer" />
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">Push Alert</span>
                                </label>
                            </div>
                            <button onClick={handleBroadcast} disabled={isSendingBroadcast} className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                                <Megaphone size={16} /> {isSendingBroadcast ? "Broadcasting..." : "Broadcast Message"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* HISTORY CARD */}
                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl flex flex-col h-[700px]">
                    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2"><History size={16} className="text-slate-400"/> Broadcast History</h3>
                        <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-400">{commHistory.length} Total</span>
                    </div>
                    
                    <div className="space-y-4 overflow-y-auto scrollbar-hide pr-2 flex-1">
                        {commHistory.length === 0 ? (
                            <div className="text-center text-slate-500 text-xs py-20 italic flex flex-col items-center gap-2"><Bell size={32} className="opacity-20"/> No broadcasts have been sent yet.</div>
                        ) : (
                            commHistory.map(msg => (
                                <div key={msg.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/50 group-hover:bg-indigo-500 transition-colors"></div>
                                    <div className="flex justify-between items-start mb-2 pl-2">
                                        <h4 className="text-sm font-bold text-white leading-tight pr-4">{msg.title}</h4>
                                        <span className="text-[9px] text-slate-500 font-mono shrink-0 bg-black/50 px-2 py-0.5 rounded">{msg.date}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 pl-2 mb-3 line-clamp-2">{msg.body}</p>
                                    <div className="flex justify-between items-center pl-2 pt-3 border-t border-white/5 mt-auto">
                                        <p className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded uppercase flex items-center gap-1"><Users size={10}/> {msg.target}</p>
                                        <span className="text-[10px] text-slate-500">Sent to {msg.count}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};