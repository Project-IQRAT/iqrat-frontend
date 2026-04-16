import React from 'react';
import { Activity, ShieldAlert, MapPin } from 'lucide-react';

export const GeofencingView = ({
    currentToken, showToast,
    activeBeacons, violationLogs,
    geoRadius, setGeoRadius,
    geofenceActive, setGeofenceActive,
    isSavingGeo, setIsSavingGeo
}) => {

    const handleSaveGeoSettings = async () => {
        setIsSavingGeo(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/system/geofence/settings`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
                body: JSON.stringify({ strict_mode: geofenceActive, allowed_radius: geoRadius })
            });
            if (res.ok) showToast("Global Geofence settings updated successfully!", "success");
            else showToast("Failed to update settings.", "error");
        } catch { showToast("Network error.", "error"); } 
        finally { setIsSavingGeo(false); }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Beacon Security & Live Radar</h2>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 flex items-center justify-between shadow-lg">
                    <div><p className="text-xs text-slate-500 font-bold uppercase">Active Class Beacons</p><p className="text-3xl font-bold text-emerald-400 mt-1">{activeBeacons.length}</p></div>
                    <div className="p-4 bg-emerald-500/10 rounded-full"><Activity size={24} className="text-emerald-400 animate-pulse"/></div>
                </div>
                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 flex items-center justify-between shadow-lg">
                    <div><p className="text-xs text-slate-500 font-bold uppercase">Blocked Scans Today</p><p className="text-3xl font-bold text-rose-400 mt-1">{violationLogs.length}</p></div>
                    <div className="p-4 bg-rose-500/10 rounded-full"><ShieldAlert size={24} className="text-rose-400"/></div>
                </div>
                <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 flex items-center justify-between shadow-lg">
                    <div><p className="text-xs text-slate-500 font-bold uppercase">System Accuracy</p><p className="text-3xl font-bold text-indigo-400 mt-1">High</p></div>
                    <div className="p-4 bg-indigo-500/10 rounded-full"><MapPin size={24} className="text-indigo-400"/></div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
                {/* Left Column: Global Settings & Violations */}
                <div className="flex flex-col gap-6 h-full">
                    {/* Global Beacon Settings */}
                    <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 shadow-lg h-fit">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-white font-bold text-sm">Global Beacon Rules</span>
                            <button onClick={() => setGeofenceActive(!geofenceActive)} className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${geofenceActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                                {geofenceActive ? "STRICT MODE" : "RELAXED MODE"}
                            </button>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-xs text-slate-500 uppercase font-bold">Allowed Radius (Meters)</label>
                                    <span className="text-xs font-bold text-indigo-400">{geoRadius}m</span>
                                </div>
                                <input type="range" min="5" max="100" value={geoRadius} onChange={(e) => setGeoRadius(e.target.value)} className="w-full accent-indigo-500 cursor-pointer" />
                                <p className="text-[10px] text-slate-500 mt-1">Max distance a student can be from the lecturer's phone.</p>
                            </div>
                            <button onClick={handleSaveGeoSettings} disabled={isSavingGeo} className="w-full py-2.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">
                                {isSavingGeo ? "Saving..." : "Apply Global Settings"}
                            </button>
                        </div>
                    </div>

                    {/* Live Violation Feed */}
                    <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 flex-1 flex flex-col overflow-hidden shadow-lg">
                        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2"><ShieldAlert size={16} className="text-rose-500"/> Security Log</h3>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 animate-pulse"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> Live</span>
                        </div>
                        <div className="overflow-y-auto pr-2 space-y-3 scrollbar-hide flex-1">
                            {violationLogs.length === 0 ? (
                                <div className="text-center text-slate-500 text-xs py-10 italic">No violations detected today.</div>
                            ) : (
                                violationLogs.map(log => (
                                    <div key={log.id} className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                                        <div className="flex justify-between items-start pl-2">
                                            <div>
                                                <p className="text-xs font-bold text-white">{log.student_name}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">{log.roll_no}</p>
                                            </div>
                                            <span className="text-[9px] text-slate-500">{log.time_ago}</span>
                                        </div>
                                        <div className="mt-2 pl-2 flex justify-between items-end">
                                            <p className="text-[10px] text-rose-400 font-bold">{log.distance_away} away</p>
                                            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[9px] rounded uppercase border border-rose-500/20">{log.action_taken}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Live GCU Campus Map Visualizer */}
                <div className="lg:col-span-2 bg-[#0c0c0e] border border-white/10 rounded-3xl relative overflow-hidden group shadow-lg">
                    <div className="absolute inset-0 bg-[#0a0f18]"></div>
                    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Map_of_Lahore.jpg')] bg-cover bg-center opacity-30 mix-blend-luminosity filter contrast-125 saturate-50 transition-opacity duration-700"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none"></div>

                    <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 z-10">
                        <p className="text-xs text-white font-bold flex items-center gap-2"><Activity size={14} className="text-emerald-400"/> Live Campus Radar</p>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                        {activeBeacons.length === 0 && <p className="text-slate-500 text-sm font-bold z-10 bg-black/50 px-4 py-2 rounded-xl border border-white/10">No classes currently active.</p>}
                        
                        {activeBeacons.map((beacon, i) => (
                            <div key={beacon.id} className="absolute" style={{ marginTop: `${(i * 40) - 60}px`, marginLeft: `${(i % 2 === 0 ? 1 : -1) * (i * 60)}px` }}>
                                <div className="relative flex items-center justify-center cursor-pointer group/beacon">
                                    <div className="absolute w-24 h-24 bg-emerald-500/20 rounded-full animate-ping"></div>
                                    <div className="absolute w-12 h-12 border border-emerald-500/50 rounded-full animate-pulse"></div>
                                    <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)] z-10"></div>
                                    
                                    {/* Tooltip Info */}
                                    <div className="absolute bottom-6 left-6 bg-black/90 border border-white/10 p-3 rounded-xl shadow-2xl w-48 z-20 backdrop-blur-sm opacity-0 group-hover/beacon:opacity-100 transition-opacity duration-300 pointer-events-none">
                                        <p className="text-xs font-bold text-white truncate">{beacon.subject_name}</p>
                                        <p className="text-[10px] text-slate-400">{beacon.lecturer_name}</p>
                                        <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1">
                                            <span className="text-[10px] text-emerald-400 font-mono flex justify-between">GPS: <span>{beacon.lat.substring(0,6)}, {beacon.lng.substring(0,6)}</span></span>
                                            <span className="text-[10px] text-indigo-400 font-mono flex justify-between">Radius: <span>{geoRadius}m</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 z-10 max-w-xs">
                        <p className="text-[10px] text-slate-400 mb-1">Beacon Mode Active</p>
                        <p className="text-xs text-white leading-tight">Lecturer mobile devices are currently broadcasting anchor coordinates.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};