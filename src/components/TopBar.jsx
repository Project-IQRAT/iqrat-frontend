import React from "react";
import logoImg from "../assets/iqrat-logo.jpg";

function TopBar({ rightContent }) {
  return (
    <header className="w-full border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-white to-slate-500 rounded-full opacity-25 group-hover:opacity-50 blur transition duration-500"></div>
            <img
              src={logoImg}
              alt="IQRAT Logo"
              className="relative h-10 w-10 rounded-full border border-white/10 object-cover"
            />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            IQRAT
          </span>
        </div>

        {/* Right Content (User Profile / Logout) */}
        <div className="flex items-center gap-4">
          {rightContent}
        </div>
      </div>
    </header>
  );
}

export default TopBar;