import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logoImg from "../assets/iqrat-logo.png";

// Helper function to decode JWT token
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

function LoginPage({ onClose }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  // --- LOGIN STATE ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // --- NEW: FORCE RESET STATE ---
  const [isForceReset, setIsForceReset] = useState(false);
  const [tempAuthData, setTempAuthData] = useState({ username: "", tempPassword: "" });
  const [forceNewPassword, setForceNewPassword] = useState("");
  const [forceConfirmPassword, setForceConfirmPassword] = useState("");

  // --- FORGOT PASSWORD STATE ---
  // 0: Hidden, 1: Request OTP, 2: Verify OTP, 3: Set New Password
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0); 
  const [fpContact, setFpContact] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");

  const AVATAR_EYE_COLOR = "#3B82F6";
  const isModal = !!onClose;

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMsg(errorData.detail || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      // --- NEW: CATCH FIRST-TIME LOGIN ---
      if (data.status === "password_change_required") {
          setTempAuthData({ username: data.username, tempPassword: data.temp_password });
          setIsForceReset(true);
          setIsLoading(false);
          return;
      }

      // Normal Login Flow...
      const token = data.access_token;
      const decodedToken = decodeJWT(token);
      const userRole = decodedToken?.role?.toLowerCase() || "student";

      const userData = { role: userRole, identifier: username, email: decodedToken?.sub };
      login(userData, token);

      if (userRole === "student") navigate("/student");
      else if (userRole === "lecturer") navigate("/lecturer");
      else if (userRole === "admin") navigate("/admin");
      else navigate("/");

    } catch (error) {
      setErrorMsg("Server connection failed. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForcePasswordChange = async (e) => {
      e.preventDefault();
      if (forceNewPassword !== forceConfirmPassword) {
          return setErrorMsg("New passwords do not match.");
      }

      setIsLoading(true);
      setErrorMsg("");

      const formData = new URLSearchParams();
      formData.append("username", tempAuthData.username);
      formData.append("current_password", tempAuthData.tempPassword);
      formData.append("new_password", forceNewPassword);

      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/force-password-change`, {
              method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: formData
          });
          const data = await res.json();
          
          if (res.ok) {
              setSuccessMsg("Password updated successfully! Logging you in...");
              setIsForceReset(false);
              setPassword(forceNewPassword);
              // Small delay then automatically submit the standard login form
              setTimeout(() => {
                  document.getElementById("standard-login-btn").click();
              }, 1500);
          } else {
              setErrorMsg(data.detail);
          }
      } catch (err) {
          setErrorMsg("Network Error.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleRequestOTP = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setErrorMsg("");
      
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("contact", fpContact);

      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/forgot-password/request-otp`, {
              method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: formData
          });
          const data = await res.json();
          if (res.ok) {
              setSuccessMsg(data.msg);
              setForgotPasswordStep(2);
          } else {
              setErrorMsg(data.detail);
          }
      } catch (err) { setErrorMsg("Network Error."); } finally { setIsLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setErrorMsg("");
      setSuccessMsg("");
      
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("otp", fpOtp);

      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/forgot-password/verify-otp`, {
              method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: formData
          });
          const data = await res.json();
          if (res.ok) {
              setSuccessMsg(data.msg);
              setForgotPasswordStep(3);
          } else {
              setErrorMsg(data.detail);
          }
      } catch (err) { setErrorMsg("Network Error."); } finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e) => {
      e.preventDefault();
      if (fpNewPassword !== fpConfirmPassword) return setErrorMsg("Passwords do not match!");
      
      setIsLoading(true);
      setErrorMsg("");
      
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("otp", fpOtp);
      formData.append("new_password", fpNewPassword);

      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/forgot-password/reset`, {
              method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: formData
          });
          const data = await res.json();
          if (res.ok) {
              setSuccessMsg("Password reset successfully! Logging you in...");
              setForgotPasswordStep(0);
              setPassword(fpNewPassword); // Auto-fill their new password so they can just click login
          } else {
              setErrorMsg(data.detail);
          }
      } catch (err) { setErrorMsg("Network Error."); } finally { setIsLoading(false); }
  };


  // ==========================================
  // RENDER UI
  // ==========================================
  const LoginCard = (
    <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-iqrat-fade-up overflow-hidden">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="relative group">
             <div className="absolute -inset-1 bg-white/20 rounded-xl blur opacity-20 transition duration-500"></div>
             <img src={logoImg} alt="IQRAT Logo" className="relative h-10 w-10 rounded-xl object-cover border border-white/10 grayscale-[0.2] group-hover:grayscale-0 transition-all" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
                {forgotPasswordStep > 0 ? "Reset Password" : isForceReset ? "Security Update" : "Login to IQRAT"}
            </h1>
            <p className="text-[11px] text-slate-400">Secure Access Portal</p>
          </div>
        </div>
        
        {isModal ? (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl leading-none px-2">✕</button>
        ) : (
          <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors">← Back</Link>
        )}
      </div>

      {/* Messages */}
      {errorMsg && <div className="mb-4 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs text-rose-400 text-center animate-fade-in">{errorMsg}</div>}
      {successMsg && <div className="mb-4 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 text-center animate-fade-in">{successMsg}</div>}


      {/* ======================================= */}
      {/* FORCE PASSWORD RESET (FIRST LOGIN)      */}
      {/* ======================================= */}
      {isForceReset && (
          <form onSubmit={handleForcePasswordChange} className="space-y-4 animate-fade-in">
              <div className="mb-4 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-400">
                  <p className="font-bold mb-1">Welcome to IQRAT!</p>
                  <p>For your security, you must change your temporary administrator-assigned password before continuing.</p>
              </div>

              <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 ml-1">New Secure Password</label>
                  <input type="password" placeholder="Min 8 chars, 1 uppercase, 1 symbol..." value={forceNewPassword} onChange={(e) => setForceNewPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:border-blue-500 outline-none transition-all" required />
              </div>
              <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 ml-1">Confirm New Password</label>
                  <input type="password" placeholder="Type it again" value={forceConfirmPassword} onChange={(e) => setForceConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:border-blue-500 outline-none transition-all" required />
              </div>
              
              <p className="text-[10px] text-slate-500 italic">Requirements: 8+ characters, uppercase & lowercase letters, a number, and a symbol (@$!%*?&).</p>

              <button type="submit" disabled={isLoading} className="w-full mt-4 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100" style={{ backgroundColor: AVATAR_EYE_COLOR, boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" }}>
                  {isLoading ? "Updating Security..." : "Save & Continue to Dashboard"}
              </button>
          </form>
      )}

      {/* ======================================= */}
      {/* MAIN LOGIN FORM (Step 0)                */}
      {/* ======================================= */}
      {!isForceReset && forgotPasswordStep === 0 && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
            <div className="mb-4 p-3 rounded-lg border text-xs" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)', color: '#bfdbfe' }}>
              <p>Please enter your <span className="font-bold text-white">Username</span>.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 ml-1">Username</label>
              <input type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" required />
            </div>
            
            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-slate-300 ml-1">Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" required />
              <div className="text-right mt-1">
                  <button type="button" onClick={() => { setForgotPasswordStep(1); setErrorMsg(""); setSuccessMsg(""); }} className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-bold">Forgot Password?</button>
              </div>
            </div>

            {/* FIXED: Added id="standard-login-btn" here */}
            <button id="standard-login-btn" type="submit" disabled={isLoading} className="w-full mt-4 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100" style={{ backgroundColor: AVATAR_EYE_COLOR, boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" }}>
              {isLoading ? "Authenticating..." : "Login"}
            </button>
          </form>
      )}

      {/* ======================================= */}
      {/* FORGOT PASSWORD - STEP 1 (Request OTP)  */}
      {/* ======================================= */}
      {!isForceReset && forgotPasswordStep === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-4 animate-fade-in">
            <p className="text-xs text-slate-400 mb-4">Enter your username and your registered email or phone number. We will send you a 6-digit verification code.</p>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 ml-1">Username</label>
              <input type="text" placeholder="Your system ID" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 ml-1">Registered Email or Phone</label>
              <input type="text" placeholder="name@iqrat.edu or +92..." value={fpContact} onChange={(e) => setFpContact(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" required />
            </div>

            <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setForgotPasswordStep(0)} className="w-1/3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-50">{isLoading ? "Sending..." : "Send OTP Code"}</button>
            </div>
          </form>
      )}

      {/* ======================================= */}
      {/* FORGOT PASSWORD - STEP 2 (Verify OTP)   */}
      {/* ======================================= */}
      {!isForceReset && forgotPasswordStep === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fade-in">
            <p className="text-xs text-slate-400 mb-4">Enter the 6-digit code sent to <strong className="text-white">{fpContact}</strong>.</p>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 ml-1">6-Digit OTP</label>
              <input type="text" placeholder="000000" maxLength="6" value={fpOtp} onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-xl text-center tracking-[1em] text-white focus:outline-none focus:border-emerald-500 transition-all font-mono" required />
            </div>

            <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setForgotPasswordStep(1)} className="w-1/3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors">Back</button>
                <button type="submit" disabled={isLoading || fpOtp.length < 6} className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50">{isLoading ? "Verifying..." : "Verify OTP"}</button>
            </div>
          </form>
      )}

      {/* ======================================= */}
      {/* FORGOT PASSWORD - STEP 3 (New Password) */}
      {/* ======================================= */}
      {!isForceReset && forgotPasswordStep === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
            <p className="text-xs text-slate-400 mb-4">OTP Verified! Please enter your new password below.</p>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 ml-1">New Password</label>
              <input type="password" placeholder="••••••••" value={fpNewPassword} onChange={(e) => setFpNewPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" required minLength="6" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 ml-1">Confirm New Password</label>
              <input type="password" placeholder="••••••••" value={fpConfirmPassword} onChange={(e) => setFpConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" required minLength="6" />
            </div>

            <div className="pt-2 flex gap-3">
                <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-50">{isLoading ? "Resetting..." : "Reset Password & Login"}</button>
            </div>
          </form>
      )}

      <div className="mt-6 text-center text-[10px] text-slate-600">
        <p>Protected by IQRAT Secure Access.</p>
      </div>
    </div>
  );

  if (isModal) return LoginCard;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-slate-300 selection:bg-white/20 items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-zinc-800/20 rounded-full blur-[120px] animate-float-delay"></div>
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-neutral-800/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute inset-0 bg-white/[0.02] opacity-20 brightness-100 contrast-150"></div>
      </div>
      {LoginCard}
    </div>
  );
}

export default LoginPage;