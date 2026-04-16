import React, { useEffect } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

export const Toast = ({ message, type, onClose }) => {
    // Auto-hide the alert after 3 seconds
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => onClose(), 3000);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    if (!message) return null;

    // Define colors and Lucide icons based on the alert type
    const config = {
        success: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/50" },
        error: { icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/20 border-rose-500/50" },
        info: { icon: Info, color: "text-indigo-400", bg: "bg-indigo-500/20 border-indigo-500/50" }
    };

    const { icon: Icon, color, bg } = config[type] || config.info;

    return (
        <div className="fixed top-6 right-6 z-[100] animate-fade-in flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl min-w-[250px] max-w-sm cursor-pointer transition-all hover:scale-105 bg-[#18181b]/90" onClick={onClose}>
            <div className={`p-2 rounded-lg ${bg} ${color}`}>
                <Icon size={20} />
            </div>
            <p className="text-sm font-bold text-white flex-1">{message}</p>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-slate-400 hover:text-white transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};