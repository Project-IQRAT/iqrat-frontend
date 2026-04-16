import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// --- COMPONENTS ---
import { Toast } from "../components/shared/Toast";
import { OverviewTab } from "../components/admin/OverviewTab";
import { UsersView } from "../components/admin/UsersView";
import { AcademicView } from "../components/admin/AcademicView";
import { DeviceSecurityView } from "../components/admin/DeviceSecurityView";
import { GeofencingView } from "../components/admin/GeofencingView";
import { CommunicationView } from "../components/admin/CommunicationView";
import { PoliciesView } from "../components/admin/PoliciesView";
import { ReportsView } from "../components/admin/ReportsView";
import { ProfileView } from "../components/admin/ProfileView";
import { RepeatView } from "../components/admin/RepeatView";

// --- ASSETS & ICONS ---
import logoImg from "../assets/iqrat-logo.png";
import adminPhoto from "../assets/iqrat-logo.png";
import { 
  LayoutDashboard, Users, BookOpen, Settings, ShieldAlert, FileText, 
  LogOut, Menu, X, Bell, Search, Database, Lock, Unlock, HardDrive, 
  AlertTriangle, CheckCircle, XCircle, FileSpreadsheet, Save, Activity, 
  UserPlus, MoreVertical, MapPin, Smartphone, Calendar, MessageSquare, 
  UploadCloud, Layers, Globe, Clock, History, Download, Send, ArrowLeft, Edit, Trash2,
  Building, GraduationCap, Zap, CheckSquare, Megaphone, Briefcase, User, Shield, RefreshCcw
} from "lucide-react";

// ==========================================
// 1. CONSTANTS & GLOBAL STYLES
// ==========================================
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const defaultTimeSlots = [
    { label: "8:00 AM - 9:30 AM", start: "08:00", end: "09:30" },
    { label: "9:30 AM - 11:00 AM", start: "09:30", end: "11:00" }
];

const GlobalStyles = () => (
  <style>{`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    
    @keyframes pulse-ring {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 
      70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    .animate-pulse-red { animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

    @media print {
        @page { size: landscape; margin: 10mm; }
        body * { visibility: hidden !important; }
        html, body { background: white !important; height: 100vh !important; overflow: hidden !important; }
        #timetable-export-view, #timetable-export-view * { visibility: visible !important; color: black !important; }
        #timetable-export-view { 
            position: absolute !important; left: 0 !important; top: 0 !important; width: 100vw !important; 
            background: white !important; padding: 0 !important; margin: 0 !important;
        }
        .no-print { display: none !important; }
        table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; }
        th, td { border: 1px solid #94a3b8 !important; padding: 6px !important; font-size: 10px !important; word-wrap: break-word !important; }
        th { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .tt-card { background: white !important; margin-bottom: 2px !important; padding: 2px !important; border: 1px solid #e2e8f0 !important; }
        .text-white, .text-slate-400, .text-slate-300, .text-indigo-300 { color: black !important; }
    }
  `}</style>
);

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, token: currentToken } = useAuth();
  
  // --- AUTH & PERMISSIONS ---
  const decodedToken = currentToken ? JSON.parse(atob(currentToken.split('.')[1])) : {};
  const adminRoleLevel = decodedToken.role_level || "super_admin";
  const adminPerms = decodedToken.permissions ? decodedToken.permissions.split(',') : ["ALL"];
  
  const ALL_NAV_ITEMS = [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'users', label: 'User Management', icon: Users },
      { id: 'academics', label: 'Academic Structure', icon: BookOpen },
      { id: 'geofencing', label: 'Geofencing', icon: MapPin }, 
      { id: 'security', label: 'Device Security', icon: ShieldAlert },
      { id: 'communication', label: 'Communication', icon: MessageSquare },
      { id: 'policies', label: 'Config & Policies', icon: Settings },
      { id: 'reports', label: 'Reports', icon: FileText },
      { id: 'repeats', label: 'Repeat Subjects', icon: RefreshCcw },
  ];

  const permittedNavItems = ALL_NAV_ITEMS.filter(item => 
      adminRoleLevel === "super_admin" || adminPerms.includes("ALL") || adminPerms.includes(item.id)
  );
  
  const AVAILABLE_TABS = ALL_NAV_ITEMS.map(item => ({ id: item.id, label: item.label }));

  // ==========================================
  // 3. STATE MANAGEMENT
  // ==========================================
  
  // --- Core UI State ---
  const [activeTab, setActiveTab] = useState("overview");
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notifRef = useRef(null);
  const profileMenuRef = useRef(null);
  
  const [toast, setToast] = useState({ message: "", type: "" });
  const showToast = (message, type = "info") => setToast({ message, type });

  // --- Users & Roles State ---
  const currentYearShort = new Date().getFullYear().toString().slice(-2);
  const [enrollMode, setEnrollMode] = useState("single"); 
  const [userRole, setUserRole] = useState("Student");
  const [usersList, setUsersList] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  
  const [lecturerForm, setLecturerForm] = useState({ full_name: "", employee_code: "", email: "", password: "", department_id: "", contact_no: "" });
  const [studentForm, setStudentForm] = useState({ full_name: "", roll_no: "", email: "", password: "", photo: null, department_id: "", degree_id: "", batch_type: "Morning", batch_year: currentYearShort, section_name: "", section_id: 1, contact_no: "" });
  const [adminForm, setAdminForm] = useState({ full_name: "", admin_id: "", email: "", password: "", contact_no: "", role_level: "dept_admin", department_id: "", permissions: [] });
  const [bulkForm, setBulkForm] = useState({ role: "Student", department_id: "", degree_id: "", batch_year: new Date().getFullYear(), batch_type: "Morning" });
  const [bulkFile, setBulkFile] = useState(null);

  // --- Academics & Timetable State ---
  const [academicSubTab, setAcademicSubTab] = useState(adminRoleLevel === 'super_admin' ? "structure" : "timetable"); 
  const [departments, setDepartments] = useState([]);
  const [degreesList, setDegreesList] = useState([]); 
  const [studentDegrees, setStudentDegrees] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [allSemesters, setAllSemesters] = useState([]);
  const [allOfferings, setAllOfferings] = useState([]);
  const [allClassrooms, setAllClassrooms] = useState([]);
  const [semesterSections, setSemesterSections] = useState([]);
  const [studentFormSections, setStudentFormSections] = useState([]);
  const [allTimetables, setAllTimetables] = useState([]);
  
  const [timetableFilter, setTimetableFilter] = useState("");
  const [ttDeptFilter, setTtDeptFilter] = useState("");
  const [ttDeptDegrees, setTtDeptDegrees] = useState([]);
  const [showTransferModal, setShowTransferModal] = useState(null);
  const [transferLecturerId, setTransferLecturerId] = useState("");
  const [activeTerm, setActiveTerm] = useState("Odd");

  const [deptForm, setDeptForm] = useState({ name: "", code: "" });
  const [degreeForm, setDegreeForm] = useState({ name: "", code: "", department_id: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", credit_hours: 3, degree_id: "", temp_dept_id: "", semester_no: 1 });
  const [offeringForm, setOfferingForm] = useState({ semester_id: "", subject_id: "", lecturer_id: "" });
  const [timetableForm, setTimetableForm] = useState({ semester_id: "", offering_id: "", classroom_id: "", day_of_week: "Monday", start_time: "09:00:00", end_time: "10:30:00" });
  const [classroomForm, setClassroomForm] = useState({ room_no: "", building_name: "", capacity: 60, latitude: 31.5204, longitude: 74.3587 });
  const [enrollSectionForm, setEnrollSectionForm] = useState({ semester_id: "", section_id: "", subject_id: "" });
  const [batchForm, setBatchForm] = useState({ degree_id: "", start_year: new Date().getFullYear(), end_year: new Date().getFullYear() + 4 });
  const [sectionForm, setSectionForm] = useState({ semester_id: "", name: "" });

  const [timeSlots, setTimeSlots] = useState(() => {
      const saved = localStorage.getItem("iqrat_time_slots");
      return saved ? JSON.parse(saved) : defaultTimeSlots;
  });
  const [newSlotForm, setNewSlotForm] = useState({ label: "8:00 AM - 9:30 AM", start: "08:00", end: "09:30" });

  // --- Repeat Subjects State ---
  const [repeatForm, setRepeatForm] = useState({ dept_id: '', degree_id: '', reg_no: '', semester_id: '', subject_id: '', section_id: '' });
  const [repeatDegrees, setRepeatDegrees] = useState([]);
  const [repeatSections, setRepeatSections] = useState([]);
  const [repeatSearchTerm, setRepeatSearchTerm] = useState("");

  // --- Security & Geofencing State ---
  const [deviceRequests, setDeviceRequests] = useState([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [activeBeacons, setActiveBeacons] = useState([]);
  const [violationLogs, setViolationLogs] = useState([]);
  const [geoRadius, setGeoRadius] = useState(20);
  const [geofenceActive, setGeofenceActive] = useState(true);
  const [isSavingGeo, setIsSavingGeo] = useState(false);

  // --- Communication & Policies State ---
  const [commHistory, setCommHistory] = useState([]);
  const [commForm, setCommForm] = useState({ target: "all", specificId: "", title: "", body: "", email: true, push: true });
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [policies, setPolicies] = useState({ min_attendance_pct: 80, semester_start_date: "", semester_end_date: "", grade_freeze_active: false });
  const [isSavingPolicies, setIsSavingPolicies] = useState(false);

  // --- Profile & Reports State ---
  const [adminProfileData, setAdminProfileData] = useState({ full_name: "Loading...", email: "", contact_no: "" });
  const [adminSecurity, setAdminSecurity] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [systemStats, setSystemStats] = useState({ activeCourses: 0, storageUsed: "Checking...", systemHealth: "Checking..." });
  const [submittedReports, setSubmittedReports] = useState([]);
  const [reportStats, setReportStats] = useState({ avg_pass_rate: "--", at_risk_count: "--" });
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [exportSettings, setExportSettings] = useState({ uniName: "Government College University, Lahore", termName: "Fall Semester 2026", showLogo: true, customLogoUrl: null });

  // ==========================================
  // 4. LIFECYCLE EFFECTS
  // ==========================================
  
  // UI Routing & Listeners
  useEffect(() => {
      if (activeTab === "profile") return;
      if (permittedNavItems.length > 0 && !permittedNavItems.find(t => t.id === activeTab)) {
          setActiveTab(permittedNavItems[0].id);
      }
  }, [adminPerms.join(','), activeTab]);

  useEffect(() => {
    function handleClickOutside(event) { 
        if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false); 
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setShowProfileMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
      localStorage.setItem("iqrat_time_slots", JSON.stringify(timeSlots));
  }, [timeSlots]);

  useEffect(() => {
      const format12H = (time24) => {
          if (!time24) return "";
          let [h, m] = time24.split(":");
          h = parseInt(h, 10);
          const ampm = h >= 12 ? "PM" : "AM";
          h = h % 12 || 12;
          return `${h}:${m} ${ampm}`;
      };
      setNewSlotForm(prev => ({ ...prev, label: `${format12H(prev.start)} - ${format12H(prev.end)}` }));
  }, [newSlotForm.start, newSlotForm.end]);

  // Core Data Fetching
  useEffect(() => {
    const fetchCoreData = async () => {
        try {
            const [deptRes, userRes, sysRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/departments`, { headers: { "Authorization": `Bearer ${currentToken}` } }),
                fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/all`, { headers: { "Authorization": `Bearer ${currentToken}` } }),
                fetch(`${import.meta.env.VITE_API_URL}/api/v1/system/dashboard-stats`, { headers: { "Authorization": `Bearer ${currentToken}` } })
            ]);

            if (deptRes.ok) {
                const data = await deptRes.json(); setDepartments(data);
                if (data.length > 0) {
                    setLecturerForm(prev => ({ ...prev, department_id: data[0].id }));
                    setDegreeForm(prev => ({ ...prev, department_id: data[0].id }));
                    setSubjectForm(prev => ({ ...prev, temp_dept_id: data[0].id }));
                    setStudentForm(prev => ({ ...prev, department_id: data[0].id }));
                    setClassroomForm(prev => ({ ...prev, department_id: data[0].id }));
                }
            }
            if (userRes.ok) setUsersList(await userRes.json());
            if (sysRes.ok) {
                const sysData = await sysRes.json();
                setSystemAlerts(sysData.alerts);
                setSystemStats(sysData.stats);
            }
        } catch (error) { console.error("Failed to load core data:", error); }
    };
    if (currentToken && !isSubmitting) fetchCoreData();
  }, [currentToken, isSubmitting]);

  // Universal Academic Data Fetching
  useEffect(() => {
      const fetchUniversalData = async () => {
          try {
              const [subRes, semRes, offRes, classRes, ttRes] = await Promise.all([
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/all-subjects`, { headers: { "Authorization": `Bearer ${currentToken}` } }),
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/all-semesters`, { headers: { "Authorization": `Bearer ${currentToken}` } }),
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/all-offerings`, { headers: { "Authorization": `Bearer ${currentToken}` } }),
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/classrooms`, { headers: { "Authorization": `Bearer ${currentToken}` } }),
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/all-timetables`, { headers: { "Authorization": `Bearer ${currentToken}` } })
              ]);
              if(subRes.ok) setAllSubjects(await subRes.json());
              if(semRes.ok) setAllSemesters(await semRes.json());
              if(offRes.ok) setAllOfferings(await offRes.json());
              if(classRes.ok) setAllClassrooms(await classRes.json());
              if(ttRes.ok) setAllTimetables(await ttRes.json());
          } catch(e) { console.error(e); }
      };
      if (currentToken && !isSubmitting) fetchUniversalData();
  }, [currentToken, isSubmitting]);

  // Dynamic Form Dependency Observers
  useEffect(() => {
      const fetchDegreesForDept = async () => {
          if (!subjectForm.temp_dept_id) return;
          try {
              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/degrees/${subjectForm.temp_dept_id}`, { headers: { "Authorization": `Bearer ${currentToken}` } });
              if (res.ok) {
                  const data = await res.json(); setDegreesList(data);
                  if (data.length > 0) setSubjectForm(prev => ({ ...prev, degree_id: data[0].id }));
              }
          } catch (e) { console.error(e); }
      };
      if (currentToken && subjectForm.temp_dept_id) fetchDegreesForDept();
  }, [subjectForm.temp_dept_id, currentToken]);

  useEffect(() => {
      const fetchStudentDegrees = async () => {
          if (!studentForm.department_id) { setStudentDegrees([]); return; }
          try {
              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/degrees/${studentForm.department_id}`, { headers: { "Authorization": `Bearer ${currentToken}` } });
              if (res.ok) {
                  const data = await res.json(); setStudentDegrees(data);
                  if (data.length > 0) setStudentForm(prev => ({ ...prev, degree_id: data[0].id }));
              }
          } catch (e) { console.error(e); }
      };
      if (currentToken && studentForm.department_id) fetchStudentDegrees();
  }, [studentForm.department_id, currentToken]);

  useEffect(() => {
      const fetchSections = async () => {
          if (!enrollSectionForm.semester_id) { setSemesterSections([]); return; }
          try {
              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/sections/${enrollSectionForm.semester_id}`, { headers: { "Authorization": `Bearer ${currentToken}` } });
              if (res.ok) setSemesterSections(await res.json());
          } catch(e) { console.error(e); }
      };
      fetchSections();
  }, [enrollSectionForm.semester_id, currentToken]);

  useEffect(() => {
      const fetchStudentSecs = async () => {
          if (!studentForm.semester_id) { setStudentFormSections([]); return; }
          try {
              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/sections/${studentForm.semester_id}`, { headers: { "Authorization": `Bearer ${currentToken}` } });
              if (res.ok) setStudentFormSections(await res.json());
          } catch(e) { console.error(e); }
      };
      fetchStudentSecs();
  }, [studentForm.semester_id, currentToken]);

  useEffect(() => {
      if (studentFormSections.length > 0 && studentForm.suggested_section && !studentForm.section_id) {
          const match = studentFormSections.find(s => s.name.toUpperCase() === studentForm.suggested_section.toUpperCase());
          if (match) setStudentForm(prev => ({ ...prev, section_id: match.id }));
      }
  }, [studentFormSections, studentForm.suggested_section]);

  useEffect(() => {
      if (!ttDeptFilter) { setTtDeptDegrees([]); return; }
      fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/degrees/${ttDeptFilter}`, { headers: { "Authorization": `Bearer ${currentToken}` } })
          .then(res => res.json())
          .then(data => setTtDeptDegrees(data))
          .catch(e => console.error(e));
  }, [ttDeptFilter, currentToken]);

  useEffect(() => {
      if (!repeatForm.dept_id) { setRepeatDegrees([]); return; }
      fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/degrees/${repeatForm.dept_id}`, { headers: { "Authorization": `Bearer ${currentToken}` } })
          .then(res => res.json())
          .then(data => setRepeatDegrees(data))
          .catch(e => console.error(e));
  }, [repeatForm.dept_id, currentToken]);

  useEffect(() => {
      if (!repeatForm.semester_id) { setRepeatSections([]); return; }
      fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/sections/${repeatForm.semester_id}`, { headers: { "Authorization": `Bearer ${currentToken}` } })
          .then(res => res.json())
          .then(data => setRepeatSections(data))
          .catch(e => console.error(e));
  }, [repeatForm.semester_id, currentToken]);

  // Tab-Specific Lifecycle Observers
  useEffect(() => {
      const fetchDevices = async () => {
          setIsLoadingDevices(true);
          try {
              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/device-requests`, { headers: { "Authorization": `Bearer ${currentToken}` } });
              if (res.ok) setDeviceRequests(await res.json());
          } catch(e) { console.error(e); }
          setIsLoadingDevices(false);
      };
      if (currentToken && activeTab === "security") fetchDevices();
  }, [currentToken, activeTab]);

  useEffect(() => {
      if (activeTab === "geofencing" && currentToken) {
          const fetchGeoData = async () => {
              try {
                  const [beaconsRes, logsRes, settingsRes] = await Promise.all([
                      fetch(`${import.meta.env.VITE_API_URL}/api/v1/system/geofence/active-beacons`, { headers: { "Authorization": `Bearer ${currentToken}` } }),
                      fetch(`${import.meta.env.VITE_API_URL}/api/v1/system/geofence/violations`, { headers: { "Authorization": `Bearer ${currentToken}` } }),
                      fetch(`${import.meta.env.VITE_API_URL}/api/v1/system/geofence/settings`, { headers: { "Authorization": `Bearer ${currentToken}` } })
                  ]);
                  if (beaconsRes.ok) setActiveBeacons(await beaconsRes.json());
                  if (logsRes.ok) setViolationLogs(await logsRes.json());
                  if (settingsRes.ok) {
                      const settings = await settingsRes.json();
                      setGeoRadius(settings.allowed_radius || 20);
                      setGeofenceActive(settings.strict_mode ?? true);
                  }
              } catch (error) { console.error("Failed to fetch live geofencing data:", error); }
          };
          fetchGeoData();
          const radarInterval = setInterval(fetchGeoData, 10000);
          return () => clearInterval(radarInterval);
      }
  }, [activeTab, currentToken]);

  useEffect(() => {
      if (activeTab === "communication" && currentToken) {
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/system/communication/history`, { headers: { "Authorization": `Bearer ${currentToken}` } })
              .then(res => res.json())
              .then(data => setCommHistory(data))
              .catch(() => console.error("Failed to load history"));
      }
  }, [activeTab, currentToken]);

  useEffect(() => {
      if (activeTab === "policies" && currentToken) {
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/system/settings/academic`, { headers: { "Authorization": `Bearer ${currentToken}` } })
          .then(res => res.json())
          .then(data => setPolicies(data))
          .catch(() => console.error("Failed to load policies"));
      }
  }, [activeTab, currentToken]);

  useEffect(() => {
      if (currentToken && decodedToken.sub) {
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/profile?email=${decodedToken.sub}`, { headers: { "Authorization": `Bearer ${currentToken}` } })
              .then(res => res.json())
              .then(data => setAdminProfileData({ full_name: data.full_name, email: data.email, contact_no: data.contact_no || "" }))
              .catch(e => console.error(e));
      }
  }, [currentToken]);

  useEffect(() => {
      if (activeTab === "reports" && currentToken) {
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/system/reports/history`, { headers: { "Authorization": `Bearer ${currentToken}` } })
              .then(res => res.json())
              .then(data => setSubmittedReports(data))
              .catch(() => console.error("Failed to load reports"));
              
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/system/reports/stats`, { headers: { "Authorization": `Bearer ${currentToken}` } })
              .then(res => res.json())
              .then(data => setReportStats(data))
              .catch(() => console.error("Failed to load stats"));
      }
  }, [activeTab, currentToken]);

  // ==========================================
  // 5. LOCAL HANDLERS (Export & Nav)
  // ==========================================

  const handleLogout = () => { 
      logout(); 
      setTimeout(() => navigate("/"), 10);
  };

  const handleDownloadPDF = async () => {
      const captureElement = document.getElementById('timetable-export-view');
      if (!captureElement) return;

      setIsGeneratingPDF(true);
      try {
          const canvas = await html2canvas(captureElement, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('landscape', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`${exportSettings.termName.replace(/\s+/g, '_')}_Timetable.pdf`);
      } catch (error) {
          console.error("PDF Generation Failed:", error);
          showToast("Failed to generate PDF.", "error");
      } finally {
          setIsGeneratingPDF(false);
      }
  };

  // ==========================================
  // 6. MAIN RENDER LOGIC
  // ==========================================
  return (
    <div className="min-h-screen bg-[#000000] text-slate-300 font-sans selection:bg-indigo-500/30 flex flex-col h-[100dvh] overflow-hidden">
      <GlobalStyles />
      
      {/* 3D Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-900/10 rounded-full blur-[120px] opacity-20"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] opacity-20"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setDrawerOpen(false)} />
      
      {/* Sidebar Layout */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#050505]/95 backdrop-blur-2xl border-r border-white/10 shadow-2xl transform transition-transform duration-300 ease-out ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <img src={logoImg} className="h-8 w-8 rounded-lg border border-white/10 object-cover" alt="Logo" />
              <span className="font-bold text-lg text-white tracking-wide uppercase">
                  {adminRoleLevel === 'super_admin' ? 'SUPER ADMIN' : 'DEPT ADMIN'}
              </span>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto scrollbar-hide">
            {permittedNavItems.map(item => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setDrawerOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-2xl transition-all ${activeTab === item.id ? "bg-white/10 text-white border border-white/10" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><item.icon size={20} /> {item.label}</button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Top Header Layer */}
      <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/5 transition-all duration-300 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
           <div className="flex items-center gap-4">
             <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors group"><Menu className="w-5 h-5 group-hover:scale-110 transition-transform" /></button>
             <h1 className="font-bold text-white text-lg tracking-wide uppercase">{activeTab.replace(/([A-Z])/g, ' $1').trim()}</h1>
           </div>
           
           <div className="flex items-center gap-4">
               <div className={`hidden md:flex items-center gap-2 px-3 py-1 border rounded-full ${systemAlerts.some(a => a.type === 'critical') ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${systemAlerts.some(a => a.type === 'critical') ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                  <span className={`text-[10px] font-bold uppercase ${systemAlerts.some(a => a.type === 'critical') ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {systemAlerts.some(a => a.type === 'critical') ? 'System Alert' : 'System Nominal'}
                  </span>
               </div>
               
               <div className="relative" ref={notifRef}>
                   <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors relative">
                       <Bell className="w-5 h-5" />
                       {systemAlerts.some(a => a.type === 'critical') && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>}
                   </button>
                   {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                            <div className="p-3 border-b border-white/5 bg-white/5"><h4 className="text-xs font-bold text-white uppercase tracking-wider">System Alerts</h4></div>
                            <div className="max-h-64 overflow-y-auto">
                                {systemAlerts.map((n, i) => (
                                    <div key={i} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <div className="flex justify-between items-start mb-1"><span className={`text-[10px] px-1.5 rounded border uppercase ${n.type === 'critical' ? 'text-rose-400 border-rose-500/20 bg-rose-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'}`}>{n.type}</span><span className="text-[10px] text-slate-500">{n.time}</span></div>
                                        <p className="text-xs text-slate-300 mt-1">{n.msg}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                   )}
               </div>

               <div className="relative" ref={profileMenuRef}>
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)} 
                        className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden cursor-pointer hover:border-indigo-500 transition-colors shadow-lg bg-slate-800 flex items-center justify-center ml-2"
                    >
                        <img src={adminPhoto} className="w-full h-full object-cover" alt="Admin Avatar" />
                    </button>
                    {showProfileMenu && (
                        <div className="absolute right-0 mt-3 w-56 bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                            <div className="p-4 border-b border-white/5 bg-white/5">
                                <p className="text-sm font-bold text-white uppercase">{adminRoleLevel === 'super_admin' ? 'Super Admin' : 'Dept Admin'}</p>
                                <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> System Online</p>
                            </div>
                            <div className="p-2 space-y-1">
                                <button 
                                    onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }} 
                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors flex items-center gap-3"
                                >
                                    <Settings size={16} className="text-indigo-400"/> Profile & Settings
                                </button>
                                <button 
                                    onClick={handleLogout} 
                                    className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-colors flex items-center gap-3"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
               </div>
           </div>
        </div>
      </div>

      {/* Main View Router */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative z-10 scroll-smooth scrollbar-hide">
        {activeTab === "overview" && (
            <OverviewTab 
                usersList={usersList} departments={departments} studentDegrees={studentDegrees} 
                systemAlerts={systemAlerts} adminRoleLevel={adminRoleLevel}
                setActiveTab={setActiveTab} showToast={showToast}
            />
        )}
        {activeTab === "users" && (
            <UsersView 
                currentToken={currentToken} adminRoleLevel={adminRoleLevel} setActiveTab={setActiveTab} showToast={showToast}
                enrollMode={enrollMode} setEnrollMode={setEnrollMode} userRole={userRole} setUserRole={setUserRole}
                usersList={usersList} setUsersList={setUsersList} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                roleFilter={roleFilter} setRoleFilter={setRoleFilter} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
                lecturerForm={lecturerForm} setLecturerForm={setLecturerForm} studentForm={studentForm} setStudentForm={setStudentForm}
                adminForm={adminForm} setAdminForm={setAdminForm} AVAILABLE_TABS={AVAILABLE_TABS} studentDegrees={studentDegrees}
                departments={departments} allSemesters={allSemesters} activeTerm={activeTerm} studentFormSections={studentFormSections}
                editingUser={editingUser} setEditingUser={setEditingUser} bulkForm={bulkForm} setBulkForm={setBulkForm}
                bulkFile={bulkFile} setBulkFile={setBulkFile} isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting}
            />
        )}
        {activeTab === "academics" && (
            <AcademicView
                currentToken={currentToken} adminRoleLevel={adminRoleLevel} setActiveTab={setActiveTab} showToast={showToast}
                academicSubTab={academicSubTab} setAcademicSubTab={setAcademicSubTab}
                departments={departments} setDepartments={setDepartments} degreesList={degreesList} setDegreesList={setDegreesList}
                deptForm={deptForm} setDeptForm={setDeptForm} degreeForm={degreeForm} setDegreeForm={setDegreeForm} subjectForm={subjectForm} setSubjectForm={setSubjectForm}
                batchForm={batchForm} setBatchForm={setBatchForm} sectionForm={sectionForm} setSectionForm={setSectionForm} classroomForm={classroomForm} setClassroomForm={setClassroomForm}
                offeringForm={offeringForm} setOfferingForm={setOfferingForm} timetableForm={timetableForm} setTimetableForm={setTimetableForm}
                allSubjects={allSubjects} setAllSubjects={setAllSubjects} allSemesters={allSemesters} setAllSemesters={setAllSemesters} allOfferings={allOfferings} setAllOfferings={setAllOfferings}
                allClassrooms={allClassrooms} setAllClassrooms={setAllClassrooms} allTimetables={allTimetables} setAllTimetables={setAllTimetables}
                timetableFilter={timetableFilter} setTimetableFilter={setTimetableFilter} ttDeptFilter={ttDeptFilter} setTtDeptFilter={setTtDeptFilter} ttDeptDegrees={ttDeptDegrees}
                showTransferModal={showTransferModal} setShowTransferModal={setShowTransferModal} transferLecturerId={transferLecturerId} setTransferLecturerId={setTransferLecturerId}
                timeSlots={timeSlots} setTimeSlots={setTimeSlots} newSlotForm={newSlotForm} setNewSlotForm={setNewSlotForm}
                activeTerm={activeTerm} setActiveTerm={setActiveTerm} usersList={usersList} isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting}
                setShowExportModal={setShowExportModal}
            />
        )}
        {activeTab === "repeats" && (
            <RepeatView 
                currentToken={currentToken} setActiveTab={setActiveTab} showToast={showToast}
                usersList={usersList} allSemesters={allSemesters} activeTerm={activeTerm} setActiveTerm={setActiveTerm}
                departments={departments} repeatDegrees={repeatDegrees} repeatSections={repeatSections} allSubjects={allSubjects}
                repeatForm={repeatForm} setRepeatForm={setRepeatForm} repeatSearchTerm={repeatSearchTerm} setRepeatSearchTerm={setRepeatSearchTerm}
                isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting}
            />
        )}
        {activeTab === "geofencing" && (
            <GeofencingView 
                currentToken={currentToken} showToast={showToast}
                activeBeacons={activeBeacons} violationLogs={violationLogs}
                geoRadius={geoRadius} setGeoRadius={setGeoRadius}
                geofenceActive={geofenceActive} setGeofenceActive={setGeofenceActive}
                isSavingGeo={isSavingGeo} setIsSavingGeo={setIsSavingGeo}
            />
        )}
        {activeTab === "security" && (
            <DeviceSecurityView 
                currentToken={currentToken} setActiveTab={setActiveTab} showToast={showToast}
                deviceRequests={deviceRequests} setDeviceRequests={setDeviceRequests}
                isLoadingDevices={isLoadingDevices}
            />
        )}
        {activeTab === "communication" && (
            <CommunicationView
                currentToken={currentToken} setActiveTab={setActiveTab} showToast={showToast}
                departments={departments} commHistory={commHistory} setCommHistory={setCommHistory}
                commForm={commForm} setCommForm={setCommForm}
                isSendingBroadcast={isSendingBroadcast} setIsSendingBroadcast={setIsSendingBroadcast}
            />
        )}
        {activeTab === "policies" && (
            <PoliciesView
                currentToken={currentToken} setActiveTab={setActiveTab} showToast={showToast}
                policies={policies} setPolicies={setPolicies}
                isSavingPolicies={isSavingPolicies} setIsSavingPolicies={setIsSavingPolicies}
            />
        )}
        {activeTab === "reports" && (
            <ReportsView
                currentToken={currentToken} setActiveTab={setActiveTab}
                submittedReports={submittedReports} reportStats={reportStats}
            />
        )}
        {activeTab === "profile" && (
            <ProfileView
                currentToken={currentToken} decodedToken={decodedToken} setActiveTab={setActiveTab} showToast={showToast}
                adminProfileData={adminProfileData} setAdminProfileData={setAdminProfileData}
                adminSecurity={adminSecurity} setAdminSecurity={setAdminSecurity}
                isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting}
            />
        )}
      </main>

      {/* ========================================= */}
      {/* 7. PDF EXPORT STUDIO MODAL                */}
      {/* ========================================= */}
      {showExportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 no-print">
              <div className="bg-[#18181b] border border-white/10 rounded-3xl w-full max-w-6xl h-[90vh] shadow-2xl animate-fade-in flex flex-col overflow-hidden">
                  
                  {/* Studio Header */}
                  <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40 shrink-0">
                      <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="text-emerald-400"/> Print Studio</h3>
                          <p className="text-xs text-slate-400 mt-1">Customize the header details before saving as PDF.</p>
                      </div>
                      <div className="flex gap-3">
                          <button onClick={() => setShowExportModal(false)} disabled={isGeneratingPDF} className="px-6 py-2 rounded-xl text-slate-400 hover:text-white font-bold transition-colors disabled:opacity-50">Cancel</button>
                          <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-8 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                              {isGeneratingPDF ? <Activity size={16} className="animate-spin"/> : <Download size={16}/>} 
                              {isGeneratingPDF ? "Generating PDF..." : "Save as PDF"}
                          </button>
                      </div>
                  </div>

                  <div className="flex flex-1 overflow-hidden">
                      {/* Left Sidebar: Controls */}
                      <div className="w-80 border-r border-white/5 bg-white/5 p-6 space-y-6 overflow-y-auto">
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">University / Institute Name</label>
                              <input type="text" value={exportSettings.uniName} onChange={(e) => setExportSettings({...exportSettings, uniName: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none" />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Semester Term (e.g. Fall 2026)</label>
                              <input type="text" value={exportSettings.termName} onChange={(e) => setExportSettings({...exportSettings, termName: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none" />
                          </div>
                          
                          {/* Custom Logo Uploader */}
                          <div className="pt-4 border-t border-white/5">
                              <label className="flex items-center gap-3 cursor-pointer group bg-black/30 p-4 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-colors mb-4">
                                  <input type="checkbox" checked={exportSettings.showLogo} onChange={e => setExportSettings({...exportSettings, showLogo: e.target.checked})} className="accent-emerald-500 w-5 h-5 cursor-pointer" />
                                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Include Logo</span>
                              </label>

                              {exportSettings.showLogo && (
                                  <div className="animate-fade-in">
                                      <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Upload Custom Logo</label>
                                      <input 
                                          type="file" accept="image/*" 
                                          onChange={(e) => {
                                              if (e.target.files && e.target.files[0]) {
                                                  const url = URL.createObjectURL(e.target.files[0]);
                                                  setExportSettings({...exportSettings, customLogoUrl: url});
                                              }
                                          }} 
                                          className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600/20 file:text-emerald-400 hover:file:bg-emerald-600/30 cursor-pointer outline-none"
                                      />
                                      {exportSettings.customLogoUrl && (
                                          <button onClick={() => setExportSettings({...exportSettings, customLogoUrl: null})} className="text-[10px] text-rose-400 hover:text-rose-300 mt-2 font-bold transition-colors">Remove Custom Logo</button>
                                      )}
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Right Pane: Live Document Preview */}
                      <div className="flex-1 bg-slate-900 p-8 overflow-y-auto flex justify-center items-start">
                          <div id="timetable-export-view" className="w-full max-w-[1100px] bg-white shadow-2xl text-black p-8 rounded-sm">
                              
                              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-6 mb-6">
                                  {exportSettings.showLogo && (
                                      <img src={exportSettings.customLogoUrl || logoImg} className="h-20 w-20 object-contain" alt="Logo" crossOrigin="anonymous" />
                                  )}
                                  <div className="text-center flex-1">
                                      <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">{exportSettings.uniName}</h1>
                                      <h2 className="text-lg font-bold text-slate-600 mt-1">Official Master Timetable</h2>
                                      <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">{exportSettings.termName}</p>
                                  </div>
                                  {exportSettings.showLogo && <div className="w-20"></div>}
                              </div>

                              <table className="w-full text-center border-collapse">
                                  <thead className="bg-slate-100">
                                      <tr>
                                          <th className="border border-slate-300 p-3 text-xs font-bold uppercase text-slate-700 w-20">Day</th>
                                          {timeSlots.map(ts => <th key={ts.start} className="border border-slate-300 p-3 text-[10px] font-bold uppercase text-slate-700">{ts.label}</th>)}
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {DAYS.map(day => (
                                          <tr key={day}>
                                              <td className="border border-slate-300 p-2 text-xs font-bold text-slate-800 bg-slate-50">{day.substring(0,3)}</td>
                                              {timeSlots.map(ts => {
                                                  const normalizeTime = (t) => {
                                                      if (!t) return "";
                                                      const parts = t.split(":");
                                                      return `${parts[0].padStart(2, '0')}:${parts[1]}`;
                                                  };
                                                  const cellData = allTimetables.filter(t => {
                                                      if (t.day_of_week !== day) return false;
                                                      if (normalizeTime(t.start_time) !== normalizeTime(ts.start)) return false;
                                                      const off = allOfferings.find(o => o.id === t.offering_id);
                                                      if (!off) return false;
                                                      if (timetableFilter && off.semester_id.toString() !== timetableFilter.toString()) return false;
                                                      if (ttDeptFilter) {
                                                          const sub = allSubjects.find(s => s.id === off.subject_id);
                                                          if (!sub) return false;
                                                          if (!ttDeptDegrees.some(d => d.id === sub.degree_id)) return false;
                                                      }
                                                      return true;
                                                  });
                                                  return (
                                                      <td key={ts.start} className="border border-slate-300 p-1.5 align-top w-[15%]">
                                                          {cellData.map(slot => {
                                                              const off = allOfferings.find(o => o.id === slot.offering_id);
                                                              const sub = off ? allSubjects.find(s => s.id === off.subject_id) : null;
                                                              const room = allClassrooms.find(c => c.id === slot.classroom_id);
                                                              const lec = off ? usersList.find(u => u.role?.toLowerCase() === 'lecturer' && u.profile_id === off.lecturer_id) : null;
                                                              return (
                                                                  <div key={slot.id} className="tt-card mb-1 text-left p-1.5">
                                                                      <div className="text-[10px] font-bold leading-tight mb-0.5 text-slate-900">{sub ? sub.name : 'Unknown'}</div>
                                                                      <div className="flex justify-between items-center text-[9px] text-slate-600">
                                                                          <span className="font-mono">{room ? room.room_no : 'TBD'}</span>
                                                                          <span className="truncate ml-1">{lec ? lec.name : 'TBD'}</span>
                                                                      </div>
                                                                  </div>
                                                              );
                                                          })}
                                                      </td>
                                                  );
                                              })}
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                              
                              <div className="mt-8 text-right">
                                  <p className="text-[10px] text-slate-400">Generated by IQRAT Secure Systems • {new Date().toLocaleDateString()}</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "" })} />
    </div>
  );
}

export default AdminDashboard;