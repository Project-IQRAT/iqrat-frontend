import React, { useState } from "react";
import logoImg from "../assets/iqrat-logo.png"; // Using JPG for the logo
import Iqrat3DAvatar from "../components/Iqrat3DAvatar.jsx";
import LoginPage from "./LoginPage"; 

// --- IMPORT ICONS ---
import { 
  GraduationCap, 
  Presentation, 
  ShieldCheck, 
  CheckCircle2, 
  UserCheck, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Play, 
  LogIn,
  ChevronDown
} from "lucide-react";

function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-slate-300 selection:bg-white/20 font-sans">
      
      {/* 3D Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] animate-float-delay"></div>
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      {/* Header */}
      <header className="w-full border-b border-white/5 bg-black/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            
            {/* JPG LOGO - Box/Border Removed */}
            <img 
              src={logoImg} 
              alt="IQRAT Logo" 
              className="h-9 w-9 object-cover grayscale-[0.2] hover:grayscale-0 transition-all" 
            />

            <span className="font-bold text-lg tracking-tight text-white">
              IQRAT <span className="text-slate-500 font-normal">Attendance</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            {["Features", "How it works", "Why IQRAT", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-indigo-500 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => setShowLogin(true)}
              className="text-slate-300 hover:text-white transition-colors font-medium flex items-center gap-2"
            >
              <LogIn size={16} />
              Login
            </button>
            <button className="hidden sm:inline-flex px-5 py-2 rounded-full bg-white text-black font-bold hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95">
              Request Demo
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 -mt-12 px-4">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center perspective-container min-h-[650px]">
            
            {/* Hero Text */}
            <div className="text-center lg:text-left space-y-8 z-10 lg:order-1 order-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur-md animate-iqrat-fade-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span>Live, QR‑based attendance management</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight animate-iqrat-fade-up text-white" style={{ animationDelay: '0.1s' }}>
                Smart attendance for <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">universities.</span>
              </h1>
              
              <p className="text-lg text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed animate-iqrat-fade-up" style={{ animationDelay: '0.2s' }}>
                IQRAT centralizes QR attendance, real-time analytics, and
                gamified student engagement. Stop fighting spreadsheets, start tracking presence.
              </p>

              {/* Stats Grid - With Icons */}
              <div className="grid grid-cols-3 gap-4 pt-2 animate-iqrat-fade-up" style={{ animationDelay: '0.3s' }}>
                <div className="glass-panel p-4 rounded-2xl text-center hover:bg-white/5 transition-colors border border-white/10 group">
                    <UserCheck className="w-5 h-5 text-indigo-400 mx-auto mb-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Check‑ins / day</p>
                    <p className="text-xl font-bold text-white">12k+</p>
                </div>
                <div className="glass-panel p-4 rounded-2xl text-center hover:bg-white/5 transition-colors border border-white/10 group">
                    <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">On Time</p>
                    <p className="text-xl font-bold text-emerald-200">98%</p>
                </div>
                <div className="glass-panel p-4 rounded-2xl text-center hover:bg-white/5 transition-colors border border-white/10 group">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Risk Alerts</p>
                    <p className="text-xl font-bold text-amber-200">Live</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 animate-iqrat-fade-up" style={{ animationDelay: '0.4s' }}>
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-8 py-4 rounded-xl bg-white text-black font-bold transition-all shadow-xl hover:bg-indigo-50 flex items-center justify-center gap-2 group"
                >
                  Go to Login
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors backdrop-blur-md font-medium flex items-center justify-center gap-2"
                >
                  <Play size={16} fill="currentColor" />
                  See how it works
                </a>
              </div>
            </div>

            {/* Right Side - 3D Avatar (Floating, Animated) */}
            <div className="relative flex justify-center lg:justify-end animate-float-delay lg:order-2 order-1">
              <div className="w-full max-w-xl aspect-square -mt-12 flex items-center justify-center relative group">
                 {/* 3D Avatar container - Free Floating */}
                 <div className="absolute inset-0 w-full h-full scale-110">
                    <Iqrat3DAvatar mood="focused" />
                 </div>
                 
                 {/* Floating Label */}
                 <div className="absolute bottom-8 left-8 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3 animate-pulse pointer-events-none">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div>
                        <p className="text-xs font-bold text-white">System Active</p>
                        <p className="text-[10px] text-slate-400">Tracking 24/7</p>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 border-t border-white/5 bg-black/40">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-white">
              Built for <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-300 to-indigo-500">Modern Campuses.</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Student experience",
                  icon: GraduationCap,
                  body: "Mobile-first dashboard with QR scanning, streaks, XP, and mood-based performance avatars.",
                  bullets: ["One-tap Scan QR", "Dynamic Moods", "Risk Alerts"],
                },
                {
                  title: "Lecturer tools",
                  icon: Presentation,
                  body: "Classroom QR projector mode, risk alerts, and detailed class attendance tables.",
                  bullets: ["Instant QR Gen", "Live Overview", "Export Reports"],
                },
                {
                  title: "Admin control",
                  icon: ShieldCheck,
                  body: "Institution-wide analytics, geofencing, user management, and secure access.",
                  bullets: ["Global Analytics", "Geofencing", "Audit Logs"],
                },
              ].map((card, i) => (
                <div
                  key={card.title}
                  className="glass-panel p-8 rounded-[2rem] card-3d-hover group border border-white/10 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-indigo-600/20 transition-colors border border-white/5 group-hover:border-indigo-500/30">
                    <card.icon className="w-7 h-7 text-white group-hover:text-indigo-300 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                    {card.body}
                  </p>
                  <ul className="space-y-3">
                    {card.bullets.map((b) => (
                      <li key={b} className="text-xs text-slate-300 flex items-center gap-3">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why IQRAT */}
        <section id="why" className="py-24 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-white">
              Why institutes choose <span className="text-indigo-400">IQRAT</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Capture attendance in real time",
                  desc: "Web, mobile, and classroom QR flows ensure every check‑in is captured instantly, ensuring zero data lag."
                },
                {
                  title: "Reduce time theft",
                  desc: "Dynamic QR codes that refresh every 5 seconds and optional geofencing prevent proxy attendance."
                },
                {
                  title: "Cleaner payroll & data",
                  desc: "Consistent digital attendance records make it easier to feed hours into payroll or scholarship rules."
                },
                {
                  title: "Fix mistakes seamlessly",
                  desc: "Regularization flows let students request edits for missed scans, which admins can approve in one click."
                }
              ].map((item, i) => (
                <div key={i} className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition-colors border border-white/10 group">
                  <h3 className="text-lg font-bold mb-3 text-white group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 border-t border-white/5 bg-black/40">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-white text-center">How it Works</h2>
            <div className="glass-panel p-10 rounded-[2.5rem] max-w-5xl mx-auto border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
              <div className="grid md:grid-cols-[1.5fr,1fr] gap-12 items-center">
                <ol className="space-y-8">
                  {[
                    "Lecturer starts a class and displays a dynamic QR code.",
                    "Students log in, open Scan QR, and scan from the classroom.",
                    "Attendance is stored and dashboards update instantly.",
                    "Mood and performance levels adjust based on thresholds."
                  ].map((step, i) => (
                    <li key={i} className="flex gap-5">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold text-black shadow-lg shadow-indigo-500/20">
                        {i + 1}
                      </span>
                      <p className="text-slate-300 text-sm pt-1.5 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
                
                <div className="rounded-3xl bg-[#0c0c0e] border border-white/10 p-8 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full"></div>
                  <p className="text-xs font-bold text-indigo-400 mb-6 uppercase tracking-wider border-b border-white/5 pb-2">Class Flow</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-white font-mono">09:00</span>
                        <span className="text-slate-400">QR Generated</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-white font-mono">09:02</span>
                        <span className="text-slate-400">90% Checked In</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-white font-mono">09:05</span>
                        <span className="text-emerald-400 font-bold">Session Active</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-indigo-500 w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-white text-center">FAQ</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-colors">
                <p className="font-bold text-white mb-3 flex items-center gap-2">
                    <ChevronDown size={16} className="text-indigo-400" /> 
                    What is an attendance system?
                </p>
                <p className="text-sm text-slate-400 leading-relaxed pl-6">Software that captures and manages attendance using web/mobile apps, biometric devices, and geo‑fenced check‑ins.</p>
              </div>
              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-colors">
                <p className="font-bold text-white mb-3 flex items-center gap-2">
                    <ChevronDown size={16} className="text-indigo-400" />
                    Why is it important?
                </p>
                <p className="text-sm text-slate-400 leading-relaxed pl-6">Tracking attendance manually is error‑prone. IQRAT centralizes data, prevents time theft, and simplifies reporting.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-16 border-t border-white/5 bg-black">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-slate-400 text-sm mb-3">
              For collaboration, pilots, or demo access, contact your IQRAT team.
            </p>
            <p className="text-white font-medium mb-8 text-lg hover:text-indigo-400 transition-colors cursor-pointer">project.iqrat@gmail.com</p>
            <p className="text-xs text-slate-600 font-mono">
              © {new Date().getFullYear()} IQRAT Systems. All rights reserved.
            </p>
          </div>
        </section>

      </main>

      {/* --- FLOATING LOGIN MODAL --- */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          {/* Clicking outside closes modal */}
          <div className="absolute inset-0" onClick={() => setShowLogin(false)}></div>
          
          <div className="relative z-10 w-full max-w-md">
             <LoginPage onClose={() => setShowLogin(false)} />
          </div>
        </div>
      )}

    </div>
  );
}

export default LandingPage;