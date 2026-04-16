import React from "react";
import { UploadCloud, FileText, Eye, Trash2 } from "lucide-react";

export const MaterialsView = ({
    materials,
    handleUploadMaterial,
    handleDeleteMaterial,
    setViewingFile,
    formatImageUrl
}) => {
    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Course Materials</h2>
            <div className="grid lg:grid-cols-[1fr,2fr] gap-8">
                <div className="space-y-4">
                    <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 border-dashed border-2 flex flex-col items-center justify-center hover:border-indigo-500/50 transition-colors relative group h-48">
                        <input type="file" onChange={handleUploadMaterial} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-600/20 transition-colors">
                            <UploadCloud size={24} className="text-slate-400 group-hover:text-indigo-400" />
                        </div>
                        <p className="text-white font-bold text-sm">Upload New</p>
                        <p className="text-[10px] text-slate-500 mt-1">PDF, PPTX, DOCX</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {materials.length === 0 ? (
                        <div className="text-center text-slate-500 py-10 italic">No materials uploaded.</div>
                    ) : materials.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-[#0c0c0e] border border-white/10 rounded-xl hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center text-indigo-400">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{item.name}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 rounded-full border border-emerald-500/20">Published</span>
                                        <p className="text-[10px] text-slate-500">{item.size} • {item.date}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setViewingFile(formatImageUrl(item.path))} className="p-2 text-slate-500 hover:text-white transition-colors">
                                    <Eye size={16} />
                                </button>
                                <button onClick={() => handleDeleteMaterial(item.id)} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};