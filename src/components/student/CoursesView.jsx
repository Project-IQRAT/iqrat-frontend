import React from "react";
import { BookOpen, GraduationCap, FileText, Download, Megaphone, X } from "lucide-react";

export const CoursesView = ({
    isLoadingCourses,
    viewingCourse,
    setViewingCourse,
    isLoadingDetails,
    courseDetails,
    subjects,
    formatImageUrl
}) => {
    if (isLoadingCourses) return <div className="text-center py-20 text-slate-500">Loading courses...</div>;

    if (viewingCourse) {
        return (
            <div className="max-w-5xl mx-auto py-8 animate-fade-in pb-24">
                <button onClick={() => setViewingCourse(null)} className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <div className="p-1 rounded-full bg-white/10"><X size={14} /></div> Back to Courses
                </button>
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: COURSE MATERIALS */}
                    <div className="lg:col-span-2 bg-[#0c0c0e] border border-white/10 rounded-3xl overflow-hidden p-6 md:p-8 h-fit shadow-xl">
                        <div className="border-b border-white/5 pb-6 mb-6">
                            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">{viewingCourse.code}</span>
                            <h2 className="text-3xl font-bold text-white mt-3">{viewingCourse.name}</h2>
                            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                               {viewingCourse.section} • <GraduationCap size={14}/> {viewingCourse.lecturer}
                            </p>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FileText size={18} className="text-indigo-400"/> Course Materials</h3>
                        
                        {isLoadingDetails ? (
                            <p className="text-slate-500 text-sm animate-pulse">Loading materials...</p>
                        ) : courseDetails.materials.length === 0 ? (
                            <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center">
                                <p className="text-slate-500 text-sm">No materials uploaded yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {courseDetails.materials.map(mat => (
                                    <div key={mat.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 shrink-0"><FileText size={20} /></div>
                                            <div>
                                                <p className="text-sm font-bold text-white line-clamp-1">{mat.name}</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{mat.size} • Uploaded {mat.date}</p>
                                            </div>
                                        </div>
                                        <a href={formatImageUrl(mat.path)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 text-[11px] font-bold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-lg hover:bg-indigo-600/40 transition-colors shrink-0">
                                            <Download size={14} /> Download
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* RIGHT COLUMN: ANNOUNCEMENTS */}
                    <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl overflow-hidden p-6 h-fit shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Megaphone size={18} className="text-rose-400"/> Announcements</h3>
                        {isLoadingDetails ? (
                            <p className="text-slate-500 text-sm animate-pulse">Loading...</p>
                        ) : courseDetails.announcements.length === 0 ? (
                            <p className="text-slate-500 text-sm">No announcements yet.</p>
                        ) : (
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                                {courseDetails.announcements.map(ann => (
                                    <div key={ann.id} className="p-4 bg-black/40 border border-white/5 rounded-xl border-l-2 border-l-rose-500">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-white font-bold text-sm leading-tight pr-2">{ann.title}</h4>
                                            <span className="text-[9px] text-slate-500 shrink-0">{ann.date}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{ann.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 animate-fade-in pb-24">
            <h2 className="text-2xl font-bold text-white mb-6">Registered Courses</h2>
            {subjects.length === 0 ? (
                <div className="text-center p-12 bg-[#0c0c0e] border border-dashed border-white/10 rounded-3xl">
                    <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-xl font-bold text-white">No Courses Enrolled</h3>
                    <p className="text-slate-500 mt-2">You haven't been enrolled in any courses by the administration yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((sub, i) => (
                        <div key={i} onClick={() => setViewingCourse(sub)} className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 hover:border-indigo-500/40 transition-colors group relative overflow-hidden cursor-pointer">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors"></div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs font-mono text-indigo-300">{sub.code}</span>
                                <span className="text-xs text-slate-500 font-bold">{sub.section}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 leading-tight">{sub.name}</h3>
                            <p className="text-xs text-slate-400 mb-4 flex items-center gap-1"><GraduationCap size={12}/> {sub.lecturer}</p>
                            
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${sub.attendance}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-[10px] text-slate-500">{sub.totalHeld || 0} Classes Held</p>
                                <p className="text-[10px] text-slate-400 font-bold">{sub.attendance}% Attendance</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};