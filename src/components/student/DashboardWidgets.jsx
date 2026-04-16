import React from "react";
import { Trophy, Medal } from "lucide-react";

// eslint-disable-next-line no-unused-vars
export const GridStatCard = ({ title, value, sub, icon: Icon, colorClass }) => (
  <div className="bg-[#0c0c0e] border border-white/10 hover:border-white/20 transition-all duration-300 rounded-3xl p-4 sm:p-6 flex flex-col justify-center relative overflow-hidden group h-full min-h-[140px]">
     <div className={`absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-15 transition-opacity rounded-full blur-2xl -mr-8 -mt-8 ${colorClass.replace('text-', 'bg-')}`}></div>
     <div className="flex justify-between items-start mb-1 lg:mb-2">
         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest z-10 truncate pr-2">{title}</p>
         <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colorClass} opacity-80 z-10 shrink-0`} />
     </div>
     <div className="flex items-baseline gap-2 z-10 mt-1">
         <span className="text-3xl lg:text-4xl font-bold text-white leading-none tracking-tight">{value}</span>
     </div>
     <span className={`text-[10px] sm:text-xs ${colorClass} font-bold mt-2 z-10 leading-tight truncate`}>{sub}</span>
  </div>
);

// eslint-disable-next-line no-unused-vars
export const CompactStatCard = ({ title, value, sub, icon: Icon, color }) => (
  <div className="bg-[#121214] border border-white/5 rounded-xl p-2 flex flex-col justify-center relative overflow-hidden h-full group">
     <div className={`absolute top-0 right-0 p-1 opacity-20 ${color}`}><Icon size={18} /></div>
     <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider z-10">{title}</p>
     <div className="flex items-baseline gap-1 z-10"><span className="text-lg font-bold text-white leading-tight">{value}</span></div>
     <span className={`text-[8px] ${color} font-medium z-10`}>{sub}</span>
  </div>
);

export const AIPredictionChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  const height = 120; const width = 400; const maxVal = 100;
  const points = data.map((pred, index) => {
    const x = (index / (Math.max(data.length - 1, 1))) * width;
    const y = height - (pred.predicted_score / maxVal) * height;
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="w-full h-full mt-2 group select-none min-h-0 flex-1 relative">
      <svg viewBox="-30 -10 430 140" className="w-full h-full overflow-visible preserve-3d">
        <defs>
          <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </linearGradient>
          <filter id="glowAi" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {[0, 50, 100].map((val, i) => {
          const y = height - (val / 100) * height;
          return (
            <g key={i}>
              <line x1="0" y1={y} x2={width} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x="-10" y={y + 3} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="monospace">{val}%</text>
            </g>
          );
        })}
        <polygon points={areaPoints} fill="url(#aiGradient)" />
        <polyline points={points} fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glowAi)" />
        {data.map((pred, index) => {
          const x = (index / (Math.max(data.length - 1, 1))) * width;
          const y = height - (pred.predicted_score / maxVal) * height;
          return (
            <g key={pred.subject_code} className="group/point cursor-pointer">
              <line x1={x} y1={y} x2={x} y2={height} stroke="#f43f5e" strokeWidth="1" strokeDasharray="4" className="opacity-0 group-hover/point:opacity-50 transition-opacity" />
              <circle cx={x} cy={y} r="4" fill="#1e1e2e" stroke="#fb7185" strokeWidth="2" className="transition-all duration-300 group-hover/point:r-6 group-hover/point:fill-white" />
              <text x={x} y={y - 15} textAnchor="middle" fill="#fff" fontSize="10" className="opacity-0 group-hover/point:opacity-100 transition-opacity font-bold">{pred.subject_code}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const Podium = ({ topStudents }) => {
  if (!topStudents || topStudents.length < 3) return null;
  return (
      <div className="flex items-end justify-center gap-6 py-8 mb-2">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-slate-600 bg-slate-800 mb-2 overflow-hidden shadow-lg flex items-center justify-center">
             <Medal className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-xs font-bold text-slate-300">{topStudents[1]?.name || "---"}</p>
          <p className="text-[10px] text-slate-500 font-mono">{topStudents[1]?.xp || 0} XP</p>
          <div className="w-20 h-24 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-lg mt-2 flex items-center justify-center text-2xl font-bold text-slate-500 shadow-inner border-t border-slate-600">2</div>
        </div>
        <div className="flex flex-col items-center z-10">
           <Trophy className="text-yellow-400 w-8 h-8 mb-2 animate-bounce-slow" />
           <div className="w-20 h-20 rounded-full border-2 border-yellow-500 bg-slate-800 mb-2 overflow-hidden shadow-[0_0_25px_rgba(234,179,8,0.4)] flex items-center justify-center">
               <Medal className="w-10 h-10 text-yellow-400" />
           </div>
           <p className="text-sm font-bold text-white">{topStudents[0]?.name || "---"}</p>
           <p className="text-[10px] text-yellow-500 font-mono font-bold">{topStudents[0]?.xp || 0} XP</p>
           <div className="w-24 h-32 bg-gradient-to-t from-yellow-900/40 to-yellow-600 rounded-t-lg mt-2 flex items-center justify-center text-4xl font-bold text-yellow-100 shadow-xl border-t border-yellow-400">1</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-orange-800 bg-slate-800 mb-2 overflow-hidden shadow-lg flex items-center justify-center">
              <Medal className="w-8 h-8 text-orange-400" />
          </div>
          <p className="text-xs font-bold text-slate-300">{topStudents[2]?.name || "---"}</p>
          <p className="text-[10px] text-slate-500 font-mono">{topStudents[2]?.xp || 0} XP</p>
          <div className="w-20 h-20 bg-gradient-to-t from-orange-900/30 to-orange-800/60 rounded-t-lg mt-2 flex items-center justify-center text-2xl font-bold text-orange-300 shadow-inner border-t border-orange-700">3</div>
        </div>
      </div>
  );
};