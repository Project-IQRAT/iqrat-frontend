import React from "react";
import { Plus, FileText, Clock, Edit3, Trash2, X, Calendar, UploadCloud } from "lucide-react";

export const AssignmentsView = ({
    assignments,
    setShowCreateAssignmentModal,
    setShowGradingModal,
    handleDeleteAssignmentDB,
    showCreateAssignmentModal,
    newAssignmentForm,
    setNewAssignmentForm,
    assignmentFile,
    setAssignmentFile,
    handleCreateAssignmentSubmit,
    isCreatingAssignment
}) => {
    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Assignments & Tasks</h2>
                    <p className="text-sm text-slate-400">Manage submissions.</p>
                </div>
                <button onClick={() => setShowCreateAssignmentModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-colors">
                    <Plus size={16} /> Create Assignment
                </button>
            </div>
            
            <div className="grid gap-4">
                {assignments.length === 0 ? (
                    <div className="text-slate-500 text-center py-10">No assignments mapped yet.</div>
                ) : assignments.map(assign => (
                    <div key={assign.id} className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{assign.title}</h3>
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                                    <span className="flex items-center gap-1"><Clock size={12} /> Due: {assign.deadline}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] border ${assign.status === 'Active' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-slate-500 border-slate-700'}`}>
                                        {assign.status}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{assign.submissions}<span className="text-sm text-slate-500 font-normal">/{assign.total}</span></p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Submitted</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setShowGradingModal(assign.id)} className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 font-bold hover:bg-indigo-600/20 transition-colors flex items-center gap-2">
                                    <Edit3 size={14} /> Grade
                                </button>
                                <button onClick={() => handleDeleteAssignmentDB(assign.id)} className="p-2 bg-white/5 hover:bg-rose-500/20 border border-white/10 rounded-xl text-slate-400 hover:text-rose-400 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showCreateAssignmentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">New Assignment</h3>
                            <button onClick={() => setShowCreateAssignmentModal(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Title</label>
                                <input type="text" value={newAssignmentForm.title} onChange={(e) => setNewAssignmentForm({...newAssignmentForm, title: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none text-sm" placeholder="Assignment Title" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {/* --- UPDATED DROPDOWN CALENDAR --- */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Deadline</label>
                                    <div className="relative group">
                                        <input 
                                            type="date" 
                                            value={newAssignmentForm.deadline} 
                                            onChange={(e) => setNewAssignmentForm({...newAssignmentForm, deadline: e.target.value})} 
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()} 
                                            className="w-full bg-black border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white focus:border-indigo-500 outline-none text-sm cursor-pointer transition-colors hover:border-indigo-500/50" 
                                        />
                                        <Calendar className="absolute left-3 top-2.5 text-indigo-400 pointer-events-none group-hover:scale-110 transition-transform" size={16} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Max Marks</label>
                                    <input type="number" value={newAssignmentForm.maxMarks} onChange={(e) => setNewAssignmentForm({...newAssignmentForm, maxMarks: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Weight (%)</label>
                                    <input type="number" value={newAssignmentForm.weight} onChange={(e) => setNewAssignmentForm({...newAssignmentForm, weight: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Instructions</label>
                                <textarea rows="2" value={newAssignmentForm.description} onChange={(e) => setNewAssignmentForm({...newAssignmentForm, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none resize-none text-sm" placeholder="Enter instructions..." />
                            </div>
                            <div className="relative border border-dashed border-white/10 rounded-lg p-3 text-center cursor-pointer hover:border-indigo-500/50 transition-colors group">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => {
                                        if(e.target.files && e.target.files.length > 0) setAssignmentFile(e.target.files[0]);
                                    }}
                                />
                                <UploadCloud className={`mx-auto mb-1 ${assignmentFile ? 'text-indigo-400 scale-110' : 'text-slate-500'} transition-all`} size={16} />
                                <p className={`text-[10px] ${assignmentFile ? 'text-indigo-300 font-bold' : 'text-slate-400'}`}>
                                    {assignmentFile ? assignmentFile.name : "Attach Question File"}
                                </p>
                            </div>
                            <button onClick={handleCreateAssignmentSubmit} disabled={isCreatingAssignment} className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm mt-1 transition-colors disabled:opacity-50">
                                {isCreatingAssignment ? "Creating & Notifying..." : "Create & Add to Gradebook"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};