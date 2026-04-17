import React from "react";
import React, { useState } from "react";
import { Menu, Bell } from "lucide-react";

export const StudentHeader = ({
    activeTab,
    profile,
    setDrawerOpen,
    handleBellClick,
    notificationsList,
    showNotifications,
    setShowNotifications,
    userPhoto,
    setActiveTab,
    notifRef,
    handleLogout
}) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    return (
      <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/5 transition-all duration-300 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
           <div className="flex items-center gap-4">
             <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors group">
               <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
             </button>
             <div className="flex flex-col">
                <span className="font-bold text-white text-lg leading-none capitalize">{activeTab.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-[10px] text-slate-500 font-mono hidden sm:block">Student Portal • {profile.name}</span>
             </div>
           </div>
           
           <div className="flex items-center gap-4">
              {/* FIXED: notifRef is now attached here so clicking outside actually closes the menu! */}
              <div className="relative" ref={notifRef}>
                  <button onClick={handleBellClick} className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors relative">
                      <Bell className="w-5 h-5" />
                      {/* Red dot indicator if there are unread notifications */}
                      {notificationsList.some(n => !n.is_read) && <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-black"></span>}
                  </button>

                  {/* Real Notifications Dropdown Menu */}
                  {showNotifications && (
                      <>
                          <div className="absolute right-0 mt-3 w-80 bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                              <div className="p-4 border-b border-white/5 bg-white/5">
                                  <h4 className="font-bold text-white text-sm">Notifications</h4>
                              </div>
                              <div className="max-h-72 overflow-y-auto scrollbar-hide divide-y divide-white/5">
                                  {notificationsList.length === 0 ? (
                                      <p className="p-6 text-center text-xs text-slate-500">You're all caught up!</p>
                                  ) : (
                                      notificationsList.map(notif => (
                                          <div key={notif.id} onClick={() => setShowNotifications(false)} className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${notif.is_read ? 'opacity-60' : ''}`}>
                                              <div className="flex justify-between items-start mb-1">
                                                  <p className={`text-sm font-bold ${notif.is_read ? 'text-slate-300' : 'text-white'}`}>{notif.title}</p>
                                                  {!notif.is_read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>}
                                              </div>
                                              <p className="text-xs text-slate-400 line-clamp-2">{notif.message}</p>
                                              <p className="text-[9px] text-slate-500 mt-2 font-mono">{notif.time}</p>
                                          </div>
                                      ))
                                  )}
                              </div>
                          </div>
                      </>
                  )}
              </div>

              {/* CLickable Top Avatar -> Profile & Logout Dropdown */}
              <div className="relative">
                  <button 
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden hover:border-indigo-500 transition-colors focus:outline-none shadow-lg"
                  >
                      <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileMenu && (
                      <div className="absolute right-0 mt-3 w-56 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in">
                          <div className="px-4 py-3 border-b border-white/5 mb-2 bg-white/5">
                              <p className="text-sm font-bold text-white truncate leading-tight">{profile.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{profile.email}</p>
                          </div>
                          
                          <button 
                              onClick={() => { setShowProfileMenu(false); setActiveTab("profile"); }}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 font-bold hover:bg-white/5 hover:text-white transition-colors"
                          >
                              My Profile
                          </button>
                          
                          <button 
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-2.5 text-sm text-rose-400 font-bold hover:bg-rose-500/10 hover:text-rose-300 transition-colors mt-1 border-t border-white/5"
                          >
                              Sign Out
                          </button>
                      </div>
                  )}
              </div>
           </div>
        </div>
      </div>
    );
};