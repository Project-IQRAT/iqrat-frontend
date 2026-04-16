import React from "react";
import { QRCodeSVG } from 'qrcode.react'; 
import { 
  BookOpen, Calendar, Unlock, PlaySquare, Lock, 
  Square, QrCode, Users, ToggleRight, ToggleLeft, CheckCircle 
} from "lucide-react";

export const HomeView = ({
    isLoading,
    selectedClass,
    rawTimetable,
    isOverrideActive,
    setIsOverrideActive,
    sessionActive,
    openManualEntry,
    handleStartClass,
    formatTimer,
    handleStopClass,
    qrToken,
    qrSeed,
    roster,
    isLoadingRoster,
    toggleAttendance,
    handleSubmitAttendance
}) => {
  if (isLoading) return <div className="text-center py-20 text-slate-500">Loading profile...</div>;
  if (!selectedClass) return <div className="text-center py-20 text-slate-500 flex flex-col items-center"><BookOpen size={48} className="opacity-50 mb-4" />No courses assigned to you this semester.</div>;

  // --- STRICT TIME CHECK LOGIC ---
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-US', { weekday: 'long' });
  const slot = rawTimetable.find(t => t.offering_id === selectedClass?.id);

  let isTimeValid = false;
  let timeMessage = "No class scheduled right now.";

  if (isOverrideActive || sessionActive) {
      isTimeValid = true;
      timeMessage = sessionActive ? "Broadcasting Live QR" : "Makeup Class Mode Active";
  } else if (slot && slot.day === todayStr) {
      const [h, m] = slot.start.split(':').map(Number);
      const classTime = new Date();
      classTime.setHours(h, m, 0, 0);
      const diffMins = (classTime - now) / (1000 * 60);

      // Allows starting 15 mins early, and stays valid up to 90 mins after start
      if (diffMins <= 15 && diffMins >= -90) { 
          isTimeValid = true;
          timeMessage = `Scheduled Time: ${slot.start} - ${slot.end}`;
      } else {
          timeMessage = `Locked: Scheduled for ${slot.start}`;
      }
  } else {
      timeMessage = `Not scheduled for today (${todayStr})`;
  }

  return (
      <div className="max-w-full lg:h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 animate-fade-in pb-2">
          <div className="flex-1 bg-[#0c0c0e] border border-white/10 rounded-3xl relative overflow-hidden flex flex-col shadow-2xl min-h-[500px] lg:min-h-0">
              <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center bg-white/5 gap-4">
                  <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          {selectedClass?.name} 
                          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{selectedClass?.code}</span>
                      </h2>
                      <p className={`text-xs mt-1 font-bold ${isTimeValid ? 'text-emerald-400' : 'text-rose-400'}`}>{timeMessage}</p>
                  </div>
                  
                  <div className="flex gap-2">
                      <button onClick={openManualEntry} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold flex items-center gap-2 border border-white/10 transition-all text-xs">
                          <Calendar size={16} /> <span className="hidden sm:inline">Manual Entry</span>
                      </button>

                      {!sessionActive ? (
                          <div className="flex items-center gap-2">
                              {/* NEW: MAKEUP CLASS OVERRIDE BUTTON */}
                              {!isTimeValid && (
                                  <button onClick={() => {
                                      if(window.confirm("Start a Makeup/Extra Class right now? This overrides the timetable lock.")) {
                                          setIsOverrideActive(true);
                                      }
                                  }} className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-xs font-bold flex items-center gap-2">
                                      <Unlock size={14} /> Makeup Class
                                  </button>
                              )}
                              
                              <button 
                                  onClick={handleStartClass} 
                                  disabled={!isTimeValid}
                                  className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all text-sm ${isTimeValid ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 active:scale-95' : 'bg-slate-800 border border-white/5 text-slate-500 cursor-not-allowed'}`}
                              >
                                  {isTimeValid ? <PlaySquare size={18} /> : <Lock size={18} />} 
                                  {isTimeValid ? "Start" : "Locked"}
                              </button>
                          </div>
                      ) : (
                          <div className="flex items-center gap-4">
                              <div className="text-right hidden sm:block"><p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Elapsed</p><p className="text-xl font-mono font-bold text-white leading-none">{formatTimer()}</p></div>
                              <button onClick={() => {handleStopClass(); setIsOverrideActive(false);}} className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-900/20 active:scale-95 transition-all text-sm"><Square size={18} fill="currentColor" /> Stop</button>
                          </div>
                      )}
                  </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-0"> 
                  <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 pointer-events-none"></div>
                  {sessionActive ? (
                      <div className="flex flex-col items-center gap-4 z-10 w-full max-w-md h-full justify-center">
                          <div className="relative p-3 bg-white rounded-2xl shadow-[0_0_60px_rgba(16,185,129,0.3)] animate-pulse-ring">
                              <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center p-1">
                                  {qrToken ? (
                                      <QRCodeSVG value={qrToken} size={184} level="M" includeMargin={false} />
                                  ) : (
                                      <p className="text-slate-400 text-xs animate-pulse font-bold">Loading Secure QR...</p>
                                  )}
                              </div>
                          </div>
                          <div className="text-center"><p className="text-white font-medium text-lg">Scan to mark attendance</p><p className="text-xs text-slate-500 font-mono mt-1">Refreshes every 10s • Token Cycle: {qrSeed}</p></div>
                          <div className="flex gap-4 w-full justify-center mt-2">
                               <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl px-6 py-2 text-center min-w-[100px]"><p className="text-2xl font-bold text-emerald-400">{roster.filter(s => s.status === 'present').length}</p><p className="text-[10px] text-emerald-600 uppercase tracking-widest font-bold">Present</p></div>
                               <div className="bg-white/5 border border-white/5 rounded-xl px-6 py-2 text-center min-w-[100px]"><p className="text-2xl font-bold text-slate-400">{roster.filter(s => s.status === 'absent').length}</p><p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Absent</p></div>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center z-10 opacity-50">
                          <QrCode size={80} className="mx-auto text-slate-600 mb-6" />
                          <h3 className="text-xl font-bold text-white mb-2">Classroom Mode</h3>
                          <p className="text-slate-400">{isTimeValid ? "Ready to start session..." : "Outside of scheduled hours."}</p>
                      </div>
                  )}
              </div>
          </div>
          
          {/* Live Roster Sidebar */}
          <div className="w-full lg:w-96 bg-[#0c0c0e] border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden h-[600px] lg:h-auto shrink-0">
              <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center"><span className="text-sm font-bold text-white flex items-center gap-2"><Users size={16} /> Live Roster</span><span className="text-xs text-slate-500">{roster.length} Students</span></div>
              <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                  {isLoadingRoster ? (
                      <div className="text-center text-xs text-slate-500 mt-10 animate-pulse">Loading real roster...</div>
                  ) : roster.length === 0 ? (
                      <div className="text-center text-xs text-slate-600 mt-10">No students enrolled.</div>
                  ) : (
                      roster.map((student) => (
                          <div key={student.id} className={`flex items-center justify-between p-3 mb-2 rounded-xl border transition-all ${student.status === 'present' ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
                              <div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${student.status === 'present' ? 'bg-emerald-500' : 'bg-slate-700'}`}></div><div><p className={`text-sm font-bold ${student.status === 'present' ? 'text-white' : 'text-slate-400'}`}>{student.name}</p><p className="text-[10px] text-slate-500 font-mono">{student.roll}</p></div></div>
                              <button onClick={() => toggleAttendance(student.id)} className={`transition-colors focus:outline-none ${student.status === 'present' ? 'text-emerald-500' : 'text-slate-600 hover:text-slate-400'}`}>{student.status === 'present' ? <ToggleRight size={28} fill="currentColor" className="opacity-100" /> : <ToggleLeft size={28} />}</button>
                          </div>
                      ))
                  )}
              </div>
              <div className="p-4 border-t border-white/5 bg-[#0c0c0e]">
                  <button onClick={handleSubmitAttendance} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20 active:scale-95"><CheckCircle size={16} /> Finalize & Submit</button>
              </div>
          </div>
      </div>
  );
};