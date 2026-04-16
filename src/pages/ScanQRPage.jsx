import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, QrCode, X, Zap, AlertTriangle, CheckCircle, MapPin } from "lucide-react";
import { Scanner } from '@yudiel/react-qr-scanner'; 
import { useAuth } from "../contexts/AuthContext"; 

// --- CUSTOM STYLES FOR SCANNER ANIMATION ---
const ScannerStyles = () => (
  <style>{`
    @keyframes scan-line {
      0% { top: 10%; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { top: 90%; opacity: 0; }
    }
    .animate-scan {
      animation: scan-line 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
  `}</style>
);

function ScanQRPage() {
  const navigate = useNavigate();
  // Add a fallback just in case context drops on refresh
  const currentToken = useAuth()?.token || localStorage.getItem("token"); 
  
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState("scanning"); 
  const [errorMessage, setErrorMessage] = useState("");

  const getDeviceFingerprint = () => {
    let fingerprint = localStorage.getItem("device_fingerprint");
    if (!fingerprint) {
      fingerprint = `device-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("device_fingerprint", fingerprint);
    }
    return fingerprint;
  };

  // NEW: Geolocation Promisified Helper
  const getStudentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            reject(new Error("You must enable GPS Location Services to scan attendance."));
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    });
  };

  const handleScan = async (scannedData) => {
    if (!scannedData || !isScanning) return;
    
    setIsScanning(false);
    setScanStatus("processing");

    try {
      // 1. Wait for the phone to get a GPS lock
      const location = await getStudentLocation();

      // 2. Send token + real GPS to backend
      const response = await fetch("${import.meta.env.VITE_API_URL}/api/v1/academic/session/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentToken}` 
        },
        body: JSON.stringify({
          token: scannedData[0].rawValue, 
          latitude: location.latitude, 
          longitude: location.longitude,
          device_fingerprint: getDeviceFingerprint(),
          device_name: navigator.userAgent.slice(0, 50) // Basic device hint
        })
      });

      const data = await response.json();

      if (response.ok) {
        setScanStatus("success");
        setTimeout(() => {
          navigate("/student");
        }, 2000);
      } else {
        setScanStatus("error");
        setErrorMessage(data.detail || "Invalid QR Code");
        setTimeout(() => {
          setIsScanning(true);
          setScanStatus("scanning");
          setErrorMessage("");
        }, 3500);
      }
    } catch (error) {
      console.error(error);
      setScanStatus("error");
      // Distinguish between GPS errors and Network errors
      setErrorMessage(error.message.includes("GPS") || error.message.includes("Geolocation") 
        ? error.message 
        : "Network Error. Cannot connect to server.");
        
      setTimeout(() => {
        setIsScanning(true);
        setScanStatus("scanning");
      }, 3500);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-300 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <ScannerStyles />

      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#0c0c0e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <header className="w-full px-6 py-5 flex items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 rounded-lg border border-indigo-500/30 text-indigo-400">
              <QrCode size={20} />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">Scan Attendance</h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-wide">Secure Token Verification</p>
            </div>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Content */}
        <main className="p-6 flex flex-col items-center w-full">
          
          <div className="text-center mb-8">
            {scanStatus === "success" ? (
                <p className="text-sm font-bold text-emerald-400 mb-1">Attendance Marked!</p>
            ) : scanStatus === "error" ? (
                <p className="text-sm font-bold text-rose-400 mb-1 leading-tight max-w-[250px] mx-auto">{errorMessage}</p>
            ) : scanStatus === "processing" ? (
                <p className="text-sm font-bold text-indigo-400 mb-1 flex items-center justify-center gap-2">
                    <MapPin size={16} className="animate-bounce" /> Verifying Geofence...
                </p>
            ) : (
                <p className="text-sm font-medium text-white mb-1">Align QR Code</p>
            )}
            <p className="text-xs text-slate-500 mt-2">Fit the lecturer's live QR code within the frame.</p>
          </div>

          {/* Camera Viewfinder */}
          <div className={`relative w-64 h-64 rounded-3xl overflow-hidden border-4 transition-colors duration-300 shadow-inner group ${
              scanStatus === 'success' ? 'border-emerald-500' :
              scanStatus === 'error' ? 'border-rose-500' :
              scanStatus === 'processing' ? 'border-indigo-500' :
              'border-white/10 bg-black'
          }`}>
            
            {/* REAL CAMERA FEED */}
            {isScanning && (
                <div className="absolute inset-0">
                   <Scanner 
                      onScan={handleScan}
                      formats={['qr_code']}
                      components={{
                          audio: false, 
                          finder: false 
                      }}
                      styles={{ container: { width: '100%', height: '100%' } }}
                   />
                </div>
            )}

            {/* Status Overlays */}
            {scanStatus === "success" && (
                <div className="absolute inset-0 bg-emerald-900/90 flex flex-col items-center justify-center animate-fade-in z-30">
                    <CheckCircle className="text-emerald-400 w-16 h-16 mb-2" />
                    <p className="text-white font-bold tracking-widest uppercase text-xs">Verified</p>
                </div>
            )}
            {scanStatus === "error" && (
                <div className="absolute inset-0 bg-rose-900/90 flex flex-col items-center justify-center animate-fade-in z-30">
                    <AlertTriangle className="text-rose-400 w-16 h-16 mb-2" />
                    <p className="text-white font-bold tracking-widest uppercase text-xs">Failed</p>
                </div>
            )}
            {scanStatus === "processing" && (
                <div className="absolute inset-0 bg-indigo-900/90 flex flex-col items-center justify-center animate-fade-in z-30">
                    <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-bold tracking-widest uppercase text-[10px]">Processing</p>
                </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none z-10"></div>

            {/* Scanning Laser Line */}
            {isScanning && <div className="absolute left-4 right-4 h-0.5 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-scan z-20"></div>}

            {/* Corner Markers */}
            <div className="absolute inset-5 pointer-events-none z-20">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500 rounded-br-lg"></div>
            </div>
          </div>

          {/* Hints */}
          <div className="mt-8 space-y-3 w-full">
             <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <Zap size={16} className="text-amber-400 shrink-0" />
                <p className="text-[10px] text-slate-400 leading-tight">
                    Location Services <span className="font-bold text-white">must be ON</span>. Geofence requires you to be within 50m of the active class.
                </p>
             </div>
          </div>

        </main>
      </div>
      
      <p className="mt-6 text-[10px] text-slate-600 font-mono">IQRAT Secure Attendance System v1.0</p>
    </div>
  );
}

export default ScanQRPage;