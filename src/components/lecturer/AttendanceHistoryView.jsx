import React, { useState, useEffect } from "react";
import { Search, Save, Calendar, CheckSquare, Square as SquareIcon, ToggleLeft, ToggleRight } from "lucide-react";

export const AttendanceHistoryView = ({ selectedClass, currentToken, API_BASE_URL, showToast }) => {
    const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
    const [historyRoster, setHistoryRoster] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch the history whenever the date changes
    useEffect(() => {
        if (!selectedClass || !searchDate) return;
        
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/offerings/${selectedClass.id}/attendance/${searchDate}`, {
                    headers: { Authorization: `Bearer ${currentToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setHistoryRoster(data);
                } else {
                    setHistoryRoster([]);
                }
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [selectedClass, searchDate, currentToken, API_BASE_URL]);

    const toggleStatus = (id) => {
        setHistoryRoster(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s));
    };

    const markAll = (status) => {
        setHistoryRoster(prev => prev.map(s => ({ ...s, status })));
    };

    const handleSaveChanges = async () => {
        if (historyRoster.length === 0) return;
        setIsSaving(true);
        try {
            const payload = {
                offering_id: selectedClass.id,
                date: searchDate,
                attendance: historyRoster.map(s => ({ student_id: s.id, status: s.status }))
            };

            const res = await fetch(`${API_BASE_URL}/session/manual-attendance`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showToast(`Attendance for ${searchDate} updated successfully!`, "success");
            } else {
                const err = await res.json();
                showToast(`Failed to update: ${err.detail}`, "error");
            }
        } catch (e) {
            showToast("Network error while saving.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (!selectedClass) return <div className="text-center py-20 text-slate-500">Please select a class from the top menu.</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Calendar size={24} className="text-indigo-400" /> Attendance History</h2>
                    <p className="text-sm text-slate-400 mt-1">Review and edit past attendance records for {selectedClass.name}.</p>
                </div>
            </div>

            <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 shadow-xl mb-6 flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Select Date to Edit</label>
                    <input 
                        type="date" 
                        value={searchDate} 
                        onChange={(e) => setSearchDate(e.target.value)} 
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none text-sm cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                     <button onClick={() => markAll('present')} className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs hover:bg-emerald-600/20 transition-colors flex items-center justify-center gap-2"><CheckSquare size={16} /> Mark All Present</button>
                     <button onClick={() => markAll('absent')} className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 font-bold text-xs hover:bg-rose-600/20 transition-colors flex items-center justify-center gap-2"><SquareIcon size={16} /> Unmark All</button>
                </div>
            </div>

            <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h4 className="font-bold text-white text-sm">Roster for {searchDate}</h4>
                    <span className="text-xs text-slate-400">{historyRoster.filter(s => s.status === 'present').length} Present / {historyRoster.length} Total</span>
                </div>
                
                {isLoading ? (
                    <div className="p-10 text-center text-slate-500 animate-pulse">Loading past records...</div>
                ) : historyRoster.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">No students enrolled in this class.</div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {historyRoster.map(student => (
                            <div key={student.id} className={`flex items-center justify-between p-4 transition-colors ${student.status === 'present' ? 'bg-emerald-900/5 hover:bg-emerald-900/10' : 'bg-black/20 hover:bg-white/5'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${student.status === 'present' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{student.name}</p>
                                        <p className="text-xs text-slate-500 font-mono">{student.roll}</p>
                                    </div>
                                </div>
                                <button onClick={() => toggleStatus(student.id)} className={`p-2 rounded-lg transition-colors ${student.status === 'present' ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-300'}`}>
                                    {student.status === 'present' ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-6 flex justify-end sticky bottom-6">
                <button 
                    onClick={handleSaveChanges} 
                    disabled={isSaving || historyRoster.length === 0} 
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={18} /> {isSaving ? "Saving..." : "Save Overrides"}
                </button>
            </div>
        </div>
    );
};