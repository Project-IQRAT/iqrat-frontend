import React from "react";
import { Send } from "lucide-react";

export const AnnouncementsView = ({
    selectedClass,
    newAnnouncement,
    setNewAnnouncement,
    handleSendAnnouncement,
    announcements
}) => {
    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Announcements</h2>
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 h-fit">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Broadcast Message</h3>
                    <div className="space-y-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-sm text-white flex justify-between items-center">
                            {selectedClass?.name || 'Class'} 
                            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active Class</span>
                        </div>
                        <textarea 
                            rows="4" 
                            value={newAnnouncement} 
                            onChange={(e) => setNewAnnouncement(e.target.value)} 
                            placeholder="Type your announcement here..." 
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none resize-none text-sm"
                        ></textarea>
                        <button 
                            onClick={handleSendAnnouncement} 
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2"
                        >
                            <Send size={16} /> Send
                        </button>
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">History</h3>
                    {announcements.length === 0 ? (
                        <div className="p-5 text-slate-500 text-sm">No announcements sent yet.</div>
                    ) : announcements.map(ann => (
                        <div key={ann.id} className="p-5 bg-[#0c0c0e] border border-white/10 rounded-2xl">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-white font-bold">{ann.title}</h4>
                                <span className="text-[10px] text-slate-500">{ann.date}</span>
                            </div>
                            <p className="text-sm text-slate-400">{ann.message}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};