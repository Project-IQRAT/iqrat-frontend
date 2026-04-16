import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; 
import logoImg from "../assets/iqrat-logo.png";

// --- IMPORT EXTRACTED VIEWS ---
import { HomeView } from "../components/lecturer/HomeView.jsx";
import { TimetableView } from "../components/lecturer/TimetableView.jsx";
import { ProfileView } from "../components/lecturer/ProfileView.jsx";
import { AssignmentsView } from "../components/lecturer/AssignmentsView.jsx";
import { GradingView } from "../components/lecturer/GradingView.jsx";
import { StudentsView } from "../components/lecturer/StudentsView.jsx";
import { MaterialsView } from "../components/lecturer/MaterialsView.jsx";
import { AnnouncementsView } from "../components/lecturer/AnnouncementsView.jsx";
import { AttendanceHistoryView } from "../components/lecturer/AttendanceHistoryView.jsx";
import { Toast } from "../components/shared/Toast.jsx";

// --- IMPORT ICONS ---
import { 
  QrCode, BarChart3, LogOut, Menu, X, Bell, UploadCloud,
  FileText, Users, Save, ChevronDown, Calendar, CheckCircle, 
  Briefcase, Megaphone, CheckSquare, Square as SquareIcon, Download,
  ToggleRight, ToggleLeft, Plus, History
} from "lucide-react";

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    
    @keyframes pulse-ring {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    .animate-pulse-ring {
      animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `}</style>
);

// --- UTILS (Kept local to ensure paths don't break) ---
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

const formatImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob")) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
};

const MATERIALS_DB = { 1: [ { id: 1, name: "Week 1 - ER Diagrams.pdf", size: "2.4 MB", date: "2 days ago" } ] };

function LecturerDashboard() {
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const currentToken = token || localStorage.getItem("token");
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1/academic`; 
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState("home");
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [rawTimetable, setRawTimetable] = useState([]);
  const [groupedTimetable, setGroupedTimetable] = useState([]);
  const [roster, setRoster] = useState([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  const [profile, setProfile] = useState({ name: "Loading...", title: "Lecturer", email: "", phone: "+92 300 1234567", image: null });

  const [showClassSelector, setShowClassSelector] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const classSelectorRef = useRef(null);
  const notifRef = useRef(null);

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [qrToken, setQrToken] = useState("");
  const [qrSeed, setQrSeed] = useState(0);
  const [secondsSinceStart, setSecondsSinceStart] = useState(0);
  
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assessments, setAssessments] = useState([]);
  
  const [showAddAssessmentModal, setShowAddAssessmentModal] = useState(false); 
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  
  const [isOverrideActive, setIsOverrideActive] = useState(false);
  const [isGradebookLocked, setIsGradebookLocked] = useState(false);
  
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [manualDate, setManualDate] = useState("");
  const [manualRoster, setManualRoster] = useState([]); 
  
  const [newAssessment, setNewAssessment] = useState({ type: 'Quiz', name: '', max: 10, weight: 5 });
  const [newAssignmentForm, setNewAssignmentForm] = useState({ title: "", deadline: "", maxMarks: 10, weight: 5, description: "" });
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  
  const [toast, setToast] = useState({ message: "", type: "info" });
  const showToast = (message, type = "info") => setToast({ message, type });
  
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [filterAtRisk, setFilterAtRisk] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
      if (currentToken) {
          const decoded = decodeJWT(currentToken);
          if (decoded) setProfile(prev => ({ ...prev, name: decoded.name || "Lecturer", email: decoded.sub }));
      }
  }, [currentToken]);

  useEffect(() => {
      const fetchLecturerData = async () => {
          if (!profile.email) return;
          setIsLoading(true);
          try {
              const [crsRes, ttRes, notifRes, profRes] = await Promise.all([
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/lecturer/courses?email=${profile.email}`, { headers: { Authorization: `Bearer ${token}` } }),
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/lecturer/timetable?email=${profile.email}`, { headers: { Authorization: `Bearer ${token}` } }),
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/notifications?email=${profile.email}`, { headers: { Authorization: `Bearer ${token}` } }),
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/profile?email=${profile.email}`, { headers: { Authorization: `Bearer ${token}` } })
              ]);

              if (profRes.ok) {
                  const pData = await profRes.json();
                  setProfile(prev => ({ 
                      ...prev, 
                      name: pData.full_name, 
                      phone: pData.contact_no,
                      image: pData.photo_path ? formatImageUrl(pData.photo_path) : null
                  }));
              }
              
              if (crsRes.ok) {
                  const crsData = await crsRes.json();
                  setClasses(crsData);
                  if (crsData.length > 0) setSelectedClass(crsData[0]);
              }

              let fetchedNotifs = notifRes.ok ? await notifRes.json() : [];

              if (ttRes.ok) {
                  const ttData = await ttRes.json();
                  setRawTimetable(ttData);

                  const grouped = ttData.reduce((acc, slot) => {
                      const dayObj = acc.find(d => d.day === slot.day);
                      if (dayObj) dayObj.classes.push(slot);
                      else acc.push({ day: slot.day, classes: [slot] });
                      return acc;
                  }, []);

                  const dayOrder = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7 };
                  grouped.sort((a, b) => dayOrder[a.day] - dayOrder[b.day]);
                  grouped.forEach(dayObj => {
                      dayObj.classes.sort((a, b) => new Date('1970/01/01 ' + a.start) - new Date('1970/01/01 ' + b.start));
                  });
                  setGroupedTimetable(grouped);

                  let nextClassNotif = null;
                  if (ttData.length > 0) {
                      const now = new Date();
                      const todayStr = now.toLocaleDateString('en-US', { weekday: 'long' });
                      const todaysClasses = ttData.filter(c => c.day === todayStr);
                      
                      for (const cls of todaysClasses) {
                          const [h, m] = cls.start.split(':').map(Number);
                          const classTime = new Date();
                          classTime.setHours(h, m, 0, 0);
                          const diffMins = (classTime - now) / (1000 * 60);
                          
                          if (diffMins <= 15 && diffMins >= -15) {
                              nextClassNotif = {
                                  id: 'next_class_live', type: 'schedule',
                                  title: `Class Starting: ${cls.name || cls.subject}`,
                                  message: `${cls.room} • Starts at ${cls.start}`,
                                  is_read: false, time: "Live Now"
                              };
                              break;
                          }
                      }
                  }
                  setNotificationsList(nextClassNotif ? [nextClassNotif, ...fetchedNotifs] : fetchedNotifs);
              }
          } catch (error) {
              console.error("Error fetching data:", error);
          } finally {
              setIsLoading(false);
          }
      };
      fetchLecturerData();
  }, [profile.email, token]);

  useEffect(() => {
    if (!selectedClass) return;

    const fetchLiveData = async () => {
        setIsLoadingRoster(true);
        try {
            const [rosterRes, assignRes, matRes, annRes] = await Promise.all([
                fetch(`${API_BASE_URL}/offerings/${selectedClass.id}/roster`, { headers: { Authorization: `Bearer ${currentToken}` } }),
                fetch(`${API_BASE_URL}/offerings/${selectedClass.id}/assignments`, { headers: { Authorization: `Bearer ${currentToken}` } }),
                fetch(`${API_BASE_URL}/offerings/${selectedClass.id}/materials`, { headers: { Authorization: `Bearer ${currentToken}` } }),
                fetch(`${API_BASE_URL}/offerings/${selectedClass.id}/announcements`, { headers: { Authorization: `Bearer ${currentToken}` } })
            ]);

            if (rosterRes.ok) setRoster(await rosterRes.json());
            else setRoster([]);

            // --- ADDED: SAVING REAL MATERIALS AND ANNOUNCEMENTS ---
            if (matRes.ok) setMaterials(await matRes.json()); 
            else setMaterials([]);

            if (annRes.ok) setAnnouncements(await annRes.json()); 
            else setAnnouncements([]);
            // ------------------------------------------------------

            if (assignRes.ok) {
                const assignData = await assignRes.json();
                setAssignments(assignData);
                
                const dbColumns = assignData.map(a => ({
                    id: a.id, type: a.type || a.title, max: a.maxMarks, weight: a.weight, locked: false
                }));
                
                setAssessments(dbColumns);
            } else {
                setAssignments([]);
            }
        } catch (error) {
            console.error("Failed to fetch live class data:", error);
            setRoster([]);
            setAssignments([]);
        } finally {
            setIsLoadingRoster(false);
        }
    };

    fetchLiveData();
    setSessionActive(false); 
    setSecondsSinceStart(0);
    setQrToken("");
    localStorage.removeItem("current_qr_token");
  }, [selectedClass, currentToken, API_BASE_URL]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (classSelectorRef.current && !classSelectorRef.current.contains(event.target)) setShowClassSelector(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchQrToken = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/session/qr/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setQrToken(data.qr_token);
        localStorage.setItem("current_qr_token", data.qr_token); 
        setQrSeed(s => s + 1); 
      }
    } catch (error) { console.error("Failed to fetch QR:", error); }
  };

  const handleStartClass = async () => {
    if (!selectedClass) return showToast("Please select a class first.", "error");
    
    const slot = rawTimetable.find(t => t.offering_id === selectedClass.id);
    const targetTimetableId = slot ? slot.timetable_id : 1; 

    if (!navigator.geolocation) return showToast("Geolocation is not supported by your browser. Cannot start secure session.", "error");

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            try {
                const response = await fetch(`${API_BASE_URL}/session/start`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ timetable_id: targetTimetableId, latitude: latitude, longitude: longitude }) 
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    setSessionId(data.session_id);
                    setSessionActive(true); 
                    setSecondsSinceStart(0);
                    fetchQrToken(data.session_id);
                } else showToast("Start Failed: " + data.detail, "error");
            } catch (error) {
                console.error("API Error:", error);
                showToast("Server connection failed. Is backend running?", "error");
            }
        },
        (error) => {
            console.error("GPS Error:", error);
            showToast("You MUST allow location access in your browser to start a geofenced class.", "error");
        },
        { enableHighAccuracy: true } 
    );
  };

  const handleStopClass = async () => { 
    setSessionActive(false); 
    setQrToken("");
    localStorage.removeItem("current_qr_token");
    
    if (sessionId) {
      try {
        await fetch(`${API_BASE_URL}/session/stop/${sessionId}`, {
          method: "POST", headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (e) { console.error("Failed to stop class on backend"); }
    }
  };

  useEffect(() => {
    if (!sessionActive || !sessionId) return;
    const interval = setInterval(() => {
      setSecondsSinceStart(prev => {
          const next = prev + 1;
          if (next >= 600) { 
              setSessionActive(false); 
              showToast("Session timed out (10 min limit reached).", "error"); 
              return 0; 
          }
          if (next % 10 === 0) fetchQrToken(sessionId); 
          return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive, sessionId]);

  useEffect(() => {
    if (!sessionActive || !sessionId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/session/${sessionId}/live-roster`, { headers: { "Authorization": `Bearer ${token}` } });
        if (response.ok) {
          const data = await response.json();
          const presentIds = data.present_ids || [];
          setRoster(prevRoster => prevRoster.map(student => presentIds.includes(student.id) ? { ...student, status: 'present' } : student));
        }
      } catch (error) { console.error("Polling error:", error); }
    }, 3000); 

    return () => clearInterval(pollInterval);
  }, [sessionActive, sessionId, token, API_BASE_URL]);

  const toggleAttendance = (id) => setRoster(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s));

  const handleSubmitAttendance = () => {
    const presentCount = roster.filter(s => s.status === 'present').length;
    showToast(`Attendance Submitted for ${selectedClass?.name}! Present: ${presentCount}/${roster.length}`, "success");
    handleStopClass();
  };

  const openManualEntry = () => {
      setManualRoster(roster.map(s => ({ ...s, status: 'absent' })));
      setManualDate(new Date().toISOString().split('T')[0]); 
      setShowManualEntryModal(true);
  };

  const toggleManualStatus = (id) => setManualRoster(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s));
  const markAllManual = (status) => setManualRoster(prev => prev.map(s => ({ ...s, status })));

  const submitManualAttendance = async () => {
      try {
          const payload = {
              offering_id: selectedClass.id,
              date: manualDate,
              attendance: manualRoster.map(s => ({ student_id: s.id, status: s.status }))
          };

          const res = await fetch(`${API_BASE_URL}/session/manual-attendance`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
              body: JSON.stringify(payload)
          });

          if (res.ok) {
              const presentCount = manualRoster.filter(s => s.status === 'present').length;
              showToast(`Manual Attendance Saved for ${manualDate}. Present: ${presentCount}/${manualRoster.length}`, "success");
              setShowManualEntryModal(false);
          } else {
              const err = await res.json();
              showToast(`Failed to save: ${err.detail}`, "error");
          }
      } catch (e) {
          console.error(e);
          showToast("Network error while saving attendance.", "error");
      }
  };

  const handleEligibilityOverride = async (studentId, action) => {
      try {
          const res = await fetch(`${API_BASE_URL}/students/${studentId}/override-eligibility`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
              body: JSON.stringify({ offering_id: selectedClass.id, action: action })
          });
          if (res.ok) {
              showToast(`Student marked as ${action.toUpperCase()} successfully.`, "success");
              // Refresh roster to get updated percentages from DB
              const rosterRes = await fetch(`${API_BASE_URL}/offerings/${selectedClass.id}/roster`, { headers: { Authorization: `Bearer ${currentToken}` } });
              if (rosterRes.ok) setRoster(await rosterRes.json());
          } else {
              showToast("Failed to update eligibility.", "error");
          }
      } catch (e) { showToast("Network error.", "error"); }
  };

  const makeStudentEligible = (id) => handleEligibilityOverride(id, 'eligible');
  const makeStudentIneligible = (id) => handleEligibilityOverride(id, 'ineligible');
  
  const makeAllEligible = async () => {
      if(window.confirm("Are you sure you want to officially override and make ALL students eligible?")) {
          try {
              const res = await fetch(`${API_BASE_URL}/offerings/${selectedClass.id}/override-all-eligible`, {
                  method: "POST", headers: { "Authorization": `Bearer ${currentToken}` }
              });
              if (res.ok) {
                  showToast("All students marked eligible.", "success");
                  const rosterRes = await fetch(`${API_BASE_URL}/offerings/${selectedClass.id}/roster`, { headers: { Authorization: `Bearer ${currentToken}` } });
                  if (rosterRes.ok) setRoster(await rosterRes.json());
              }
          } catch(e) { showToast("Network error.", "error"); }
      }
  };

  const handleSendAlert = async (student, avgGrade) => {
      const reason = [];
      if (student.attendancePct < 75) reason.push(`Low Attendance (${student.attendancePct}%)`);
      if (avgGrade < 50) reason.push(`Low Grades (${avgGrade}%)`);
      
      try {
          const res = await fetch(`${API_BASE_URL}/students/alert`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
              body: JSON.stringify({ student_id: student.id, message: `Please improve your performance immediately. Issues detected: ${reason.join(", ")}.` })
          });
          if (res.ok) showToast(`Official Warning sent to ${student.name}'s Dashboard!`, "success");
          else showToast("Failed to send alert.", "error");
      } catch(e) { console.error(e); showToast("Network error.", "error"); }
  };

  const calculateTotal = (studentMarks) => {
    if (!studentMarks) return 0;
    return assessments.reduce((sum, ass) => sum + ((studentMarks[ass.id] || 0) / ass.max) * ass.weight, 0).toFixed(1);
  };

  const updateMark = (studentId, assessmentId, value) => {
    const cleanValue = value === '' ? '' : parseInt(value);
    setRoster(prev => prev.map(s => s.id === studentId ? { ...s, marks: { ...s.marks, [assessmentId]: cleanValue } } : s));
  };

  const handleDeleteAssessment = async (id) => {
      if (id === 'final') return showToast("Final Term column cannot be deleted.", "error");
      if (window.confirm("Are you sure you want to delete this column? It will be permanently removed for all students too.")) {
          if (!isNaN(id) && id !== 'mid') {
              try {
                  const res = await fetch(`${API_BASE_URL}/assignments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${currentToken}` } });
                  if (!res.ok) return showToast("Failed to delete from database.", "error");
                  setAssignments(prev => prev.filter(a => a.id !== id));
              } catch(e) { return showToast("Network error while deleting.", "error"); }
          }
          setAssessments(prev => prev.filter(a => a.id !== id));
      }
  };

  const handleCreateAssignmentSubmit = async () => {
      if (!selectedClass) return showToast("Please select a class first.", "error");
      if (!newAssignmentForm.title || !newAssignmentForm.deadline) return showToast("Title and Deadline are required.", "error");
      setIsCreatingAssignment(true);
      
      const formData = new FormData();
      formData.append("offering_id", selectedClass.id);
      formData.append("title", newAssignmentForm.title);
      formData.append("deadline", newAssignmentForm.deadline);
      formData.append("max_marks", newAssignmentForm.maxMarks);
      formData.append("weightage", newAssignmentForm.weight);
      formData.append("description", newAssignmentForm.description);
      if (assignmentFile) formData.append("file", assignmentFile);

      try {
          const res = await fetch(`${API_BASE_URL}/assignments`, {
              method: "POST", headers: { "Authorization": `Bearer ${currentToken}` }, body: formData
          });
          const data = await res.json();
          if (res.ok) {
              showToast(`Success: ${data.msg}`, "success");
              const newId = data.assessment_id;
              setAssignments([...assignments, { id: newId, title: newAssignmentForm.title, deadline: newAssignmentForm.deadline, submissions: 0, total: roster.length, status: "Active", maxMarks: newAssignmentForm.maxMarks }]);
              setAssessments([...assessments, { id: newId, type: newAssignmentForm.title, max: parseInt(newAssignmentForm.maxMarks), weight: parseInt(newAssignmentForm.weight), locked: false }]);
              setRoster(prev => prev.map(s => ({ ...s, marks: { ...s.marks, [newId]: 0 } })));
              setShowCreateAssignmentModal(false);
              setNewAssignmentForm({ title: "", deadline: "", maxMarks: 10, weight: 5, description: "" });
              setAssignmentFile(null);
          } else showToast(`Error: ${data.detail}`, "error");
      } catch (error) { showToast("Network error while creating assignment.", "error"); } 
      finally { setIsCreatingAssignment(false); }
  };

  const handleAddAssessmentSubmit = async () => {
      if (!selectedClass) return showToast("Select a class first.", "error");

      if (!currentToken) return showToast("Your session expired. Please log out and log back in.", "error");

      const label = newAssessment.name || newAssessment.type;
      
      try {
          const payload = { 
              offering_id: selectedClass.id, 
              title: label, 
              category: newAssessment.type, 
              max_marks: parseFloat(newAssessment.max) || 0,   // Safely parses to 0 if empty
              weightage: parseFloat(newAssessment.weight) || 0 // Safely parses to 0 if empty
          };

          const res = await fetch(`${API_BASE_URL}/assessments/manual`, {
              method: "POST", 
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
              body: JSON.stringify(payload)
          });
          
          if (res.ok) {
              const data = await res.json();
              const newId = data.assessment_id;
              
              setAssessments([...assessments, { 
                  id: newId, 
                  type: label, 
                  max: payload.max_marks, 
                  weight: payload.weightage, 
                  locked: false 
              }]);
              
              // Safely update the roster, ensuring s.marks exists
              setRoster(prev => prev.map(s => ({ 
                  ...s, 
                  marks: { ...(s.marks || {}), [newId]: 0 } 
              })));
              
              setShowAddAssessmentModal(false);
              setNewAssessment({ type: 'Quiz', name: '', max: 10, weight: 5 });
              showToast("Column added successfully!", "success");
          } else {
              // --- NEW: CATCH AND DISPLAY THE REAL BACKEND ERROR ---
              const err = await res.json();
              console.error("Backend Error:", err);
              
              // If it's a FastAPI validation error, format it nicely
              let errorMsg = err.detail;
              if (Array.isArray(err.detail)) {
                  errorMsg = err.detail.map(e => `${e.loc[e.loc.length-1]}: ${e.msg}`).join(', ');
              }
              showToast(`Failed: ${errorMsg}`, "error");
          }
      } catch (err) { 
          console.error(err); 
          showToast("Network error. Is the backend running?", "error"); 
      }
  };

  const handleSaveGrades = async () => {
      const payload = [];
      roster.forEach(student => {
          if (student.marks) {
              Object.keys(student.marks).forEach(assId => {
                  payload.push({ 
                      assessment_id: parseInt(assId), 
                      student_id: student.id, 
                      marks: student.marks[assId] === '' ? 0 : parseFloat(student.marks[assId]) 
                  });
              });
          }
      });

      if (payload.length === 0) {
          setShowGradingModal(null);
          return;
      }

      try {
          const res = await fetch(`${API_BASE_URL}/assignments/bulk-grade`, {
              method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` }, body: JSON.stringify(payload)
          });
          if (res.ok) {
              showToast("Grades saved and synced to Student Dashboards!", "success");
              setShowGradingModal(null);
              setAssignments(prev => prev.map(a => a.id === showGradingModal ? {...a, status: "Graded"} : a));
          } else {
              const err = await res.json();
              showToast(`Failed to save grades: ${err.detail}`, "error");
          }
      } catch(e) { showToast("Network error.", "error"); }
  };

  const handleDeleteAssignmentDB = async (id) => {
      if (!window.confirm("Are you sure you want to completely delete this assignment? This removes all student submissions.")) return;
      try {
          const res = await fetch(`${API_BASE_URL}/assignments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${currentToken}` } });
          if (res.ok) {
              setAssignments(prev => prev.filter(a => a.id !== id));
              setAssessments(prev => prev.filter(a => a.id !== id));
          } else showToast("Failed to delete assignment.", "error");
      } catch(e) { console.error(e); }
  };

  const handleUploadMaterial = async (e) => {
      const file = e.target.files[0];
      if (!file || !selectedClass) return;
      const formData = new FormData();
      formData.append("file", file);
      try {
          const res = await fetch(`${API_BASE_URL}/offerings/${selectedClass.id}/materials`, { method: "POST", headers: { Authorization: `Bearer ${currentToken}` }, body: formData });
          if (res.ok) {
              const data = await res.json();
              setMaterials([{ id: data.id, name: data.title, path: data.file_path, size: data.file_size, date: "Just now" }, ...materials]);
          }
      } catch (err) { console.error(err); }
  };

  const handleDeleteMaterial = async (id) => {
      if(!window.confirm("Delete this material?")) return;
      await fetch(`${API_BASE_URL}/materials/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${currentToken}` } });
      setMaterials(materials.filter(m => m.id !== id));
  };

  const handleSendAnnouncement = async () => {
      if(!newAnnouncement.trim() || !selectedClass) return;
      const formData = new FormData();
      formData.append("title", "Class Update");
      formData.append("message", newAnnouncement);

      try {
          const res = await fetch(`${API_BASE_URL}/offerings/${selectedClass.id}/announcements`, { method: "POST", headers: { Authorization: `Bearer ${currentToken}` }, body: formData });
          if (res.ok) {
              showToast("Announcement broadcasted to all students!", "success");
              setAnnouncements([{ id: Date.now(), title: "Class Update", message: newAnnouncement, date: "Just now" }, ...announcements]);
              setNewAnnouncement("");
          }
      } catch (err) { console.error(err); }
  };
  
  const handleBellClick = async () => {
      const newState = !showNotifications;
      setShowNotifications(newState);
      if (newState) {
          const unreadDbIds = notificationsList.filter(n => !n.is_read && typeof n.id === 'number').map(n => n.id);
          if (unreadDbIds.length > 0) {
              try {
                  await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/notifications/read`, { method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` }, body: JSON.stringify({ notification_ids: unreadDbIds }) });
                  setNotificationsList(prev => prev.map(n => typeof n.id === 'number' ? { ...n, is_read: true } : n));
              } catch (e) { console.error(e); }
          }
      }
  };
  
  const formatTimer = () => {
    const m = Math.floor(secondsSinceStart / 60);
    const s = secondsSinceStart % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleLogout = () => { logout(); setTimeout(() => navigate("/"), 100); };

  return (
    <div className="min-h-screen bg-[#000000] text-slate-300 font-sans selection:bg-indigo-500/30 flex flex-col h-[100dvh] overflow-hidden">
      <GlobalStyles />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
      <div className="fixed inset-0 pointer-events-none z-0"><div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] opacity-30"></div><div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] opacity-30"></div><div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 brightness-100 contrast-150"></div></div>
      <div className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setDrawerOpen(false)} />
      
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#050505]/95 backdrop-blur-2xl border-r border-white/10 shadow-2xl transform transition-transform duration-300 ease-out ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <img src={logoImg} className="h-8 w-8 rounded-lg border border-white/10 object-cover" alt="Logo" />
              <span className="font-bold text-lg text-white tracking-wide">IQRAT</span>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide mt-6">
            {[
                { id: 'home', label: 'Live Session', icon: QrCode },
                { id: 'history', label: 'Attendance History', icon: History },
                { id: 'timetable', label: 'Timetable', icon: Calendar }, 
                { id: 'assignments', label: 'Assignments', icon: Briefcase },
                { id: 'grading', label: 'Grading', icon: BarChart3 },
                { id: 'students', label: 'Students & Risk', icon: Users },
                { id: 'materials', label: 'Materials', icon: UploadCloud },
                { id: 'announcements', label: 'Announcements', icon: Megaphone },
            ].map(item => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setDrawerOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-2xl transition-all ${activeTab === item.id ? "bg-white/10 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><item.icon size={20} /> {item.label}</button>
            ))}
          </nav>
          <div className="p-6 border-t border-white/5 bg-gradient-to-t from-white/5 to-transparent"><button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-xs text-rose-300 hover:text-white py-3 border border-rose-500/20 bg-rose-500/10 rounded-xl hover:bg-rose-500/20 transition-all"><LogOut size={14} /> Sign Out</button></div>
        </div>
      </aside>

      <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/5 transition-all duration-300 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
           <div className="flex items-center gap-4">
             <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors group"><Menu className="w-5 h-5 group-hover:scale-110 transition-transform" /></button>
             {classes.length > 0 && (
               <div className="relative group" ref={classSelectorRef}>
                  <button onClick={() => setShowClassSelector(!showClassSelector)} className="flex items-center gap-2 text-white font-bold text-sm bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">
                      {selectedClass?.code} 
                      {selectedClass?.section && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded ml-1">{selectedClass.section}</span>}
                      <span className="text-slate-400 font-normal hidden sm:inline ml-1">| {selectedClass?.name}</span>
                      <ChevronDown size={14} className={`text-slate-500 transition-transform ${showClassSelector ? 'rotate-180' : ''}`} />
                  </button>
                  {showClassSelector && (
                      <div className="absolute top-full left-0 mt-2 w-72 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                          <div className="p-2 bg-white/5 border-b border-white/5 text-[10px] text-slate-500 uppercase font-bold tracking-wider">Assigned Classes</div>
                          {classes.map(cls => (
                              <button key={cls.id} onClick={() => { setSelectedClass(cls); setShowClassSelector(false); }} className={`w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors ${selectedClass?.id === cls.id ? 'bg-indigo-900/20' : ''}`}>
                                  <div className="flex justify-between items-center"><span className={`font-bold text-xs ${selectedClass?.id === cls.id ? 'text-indigo-400' : 'text-slate-300'}`}>{cls.code}</span>{selectedClass?.id === cls.id && <CheckCircle size={12} className="text-indigo-400" />}</div>
                                  <div className="text-sm text-white font-medium mt-0.5">{cls.name}</div>
                                  <div className="text-xs text-slate-500">{cls.section}</div>
                              </button>
                          ))}
                      </div>
                  )}
               </div>
             )}
           </div>
           
           <div className="flex items-center gap-6">
              <div className="relative" ref={notifRef}>
                  <button onClick={handleBellClick} className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors relative">
                      <Bell className="w-5 h-5" />
                      {notificationsList.some(n => !n.is_read) && <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-black"></span>}
                  </button>

                  {showNotifications && (
                      <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                          <div className="absolute right-0 mt-3 w-80 bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                              <div className="p-4 border-b border-white/5 bg-white/5">
                                  <h4 className="font-bold text-white text-sm">Notifications</h4>
                              </div>
                              <div className="max-h-72 overflow-y-auto scrollbar-hide divide-y divide-white/5">
                                  {notificationsList.length === 0 ? (
                                      <p className="p-6 text-center text-xs text-slate-500">You're all caught up!</p>
                                  ) : (
                                      notificationsList.map((n, i) => (
                                          <div key={n.id || i} onClick={() => setShowNotifications(false)} className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${n.is_read ? 'opacity-60' : ''}`}>
                                              <div className="flex justify-between items-start mb-1">
                                                  <span className={`text-[10px] px-1.5 rounded border uppercase ${n.type === 'schedule' ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'}`}>
                                                      {n.type || 'Alert'}
                                                  </span>
                                                  <span className="text-[10px] text-slate-500">{n.time}</span>
                                              </div>
                                              <p className={`text-sm leading-tight ${n.is_read ? 'text-slate-400' : 'text-slate-300 font-bold'}`}>{n.title}</p>
                                              {n.message && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.message}</p>}
                                          </div>
                                      ))
                                  )}
                              </div>
                          </div>
                      </>
                  )}
              </div>

              <div 
                  className="w-9 h-9 rounded-full border border-white/10 overflow-hidden cursor-pointer hover:border-indigo-500 transition-colors shadow-lg bg-slate-800 flex items-center justify-center text-white font-bold" 
                  onClick={() => setActiveTab('profile')}
              >
                  {profile.image ? <img src={profile.image} className="w-full h-full object-cover" alt="Profile" /> : profile.name.charAt(0)}
              </div>
           </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative z-10 scroll-smooth scrollbar-hide">
        {activeTab === "home" && (
            <HomeView 
                isLoading={isLoading}
                selectedClass={selectedClass}
                rawTimetable={rawTimetable}
                isOverrideActive={isOverrideActive}
                setIsOverrideActive={setIsOverrideActive}
                sessionActive={sessionActive}
                openManualEntry={openManualEntry}
                handleStartClass={handleStartClass}
                formatTimer={formatTimer}
                handleStopClass={handleStopClass}
                qrToken={qrToken}
                qrSeed={qrSeed}
                roster={roster}
                isLoadingRoster={isLoadingRoster}
                toggleAttendance={toggleAttendance}
                handleSubmitAttendance={handleSubmitAttendance}
            />
        )}
        {activeTab === "history" && (
            <AttendanceHistoryView 
                selectedClass={selectedClass}
                currentToken={currentToken}
                API_BASE_URL={API_BASE_URL}
                showToast={showToast}
            />
        )}
        {activeTab === "timetable" && (
            <TimetableView 
                isLoading={isLoading} 
                groupedTimetable={groupedTimetable} 
            />
        )}
        {activeTab === "profile" && (
            <ProfileView 
                profile={profile}
                setProfile={setProfile}
                currentToken={currentToken}
                showToast={showToast}
                setActiveTab={setActiveTab}
            />
        )}
        {activeTab === "assignments" && (
            <AssignmentsView 
                assignments={assignments}
                setShowCreateAssignmentModal={setShowCreateAssignmentModal}
                setShowGradingModal={setShowGradingModal}
                handleDeleteAssignmentDB={handleDeleteAssignmentDB}
                showCreateAssignmentModal={showCreateAssignmentModal}
                newAssignmentForm={newAssignmentForm}
                setNewAssignmentForm={setNewAssignmentForm}
                assignmentFile={assignmentFile}
                setAssignmentFile={setAssignmentFile}
                handleCreateAssignmentSubmit={handleCreateAssignmentSubmit}
                isCreatingAssignment={isCreatingAssignment}
            />
        )}
        {activeTab === "grading" && (
            <GradingView 
                isGradebookLocked={isGradebookLocked}
                setIsGradebookLocked={setIsGradebookLocked}
                setShowAddAssessmentModal={setShowAddAssessmentModal}
                handleSaveGrades={handleSaveGrades}
                selectedClass={selectedClass}
                showToast={showToast}
                currentToken={currentToken}
                API_BASE_URL={API_BASE_URL}
                assessments={assessments}
                handleDeleteAssessment={handleDeleteAssessment}
                roster={roster}
                calculateTotal={calculateTotal}
                updateMark={updateMark}
            />
        )}
        {activeTab === "students" && (
            <StudentsView 
                roster={roster}
                calculateTotal={calculateTotal}
                assessments={assessments}
                filterAtRisk={filterAtRisk}
                setFilterAtRisk={setFilterAtRisk}
                makeAllEligible={makeAllEligible}
                makeStudentEligible={makeStudentEligible}
                makeStudentIneligible={makeStudentIneligible}
                handleSendAlert={handleSendAlert}
            />
        )}
        {activeTab === "materials" && (
            <MaterialsView 
                materials={materials}
                handleUploadMaterial={handleUploadMaterial}
                handleDeleteMaterial={handleDeleteMaterial}
                setViewingFile={setViewingFile}
                formatImageUrl={formatImageUrl}
            />
        )}
        {activeTab === "announcements" && (
            <AnnouncementsView 
                selectedClass={selectedClass}
                newAnnouncement={newAnnouncement}
                setNewAnnouncement={setNewAnnouncement}
                handleSendAnnouncement={handleSendAnnouncement}
                announcements={announcements}
            />
        )}
      </main>

      {/* Modals */}
      {/* ADD MANUAL ASSESSMENT / COLUMN MODAL */}
      {showAddAssessmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#18181b] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Add Grade Column</h3>
                    <button onClick={() => setShowAddAssessmentModal(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Category / Type</label>
                        <select 
                            value={newAssessment.type} 
                            onChange={(e) => setNewAssessment({...newAssessment, type: e.target.value})}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none text-sm"
                        >
                            <option value="Quiz">Quiz</option>
                            <option value="Assignment">Assignment</option>
                            <option value="Presentation">Presentation</option>
                            <option value="Mid Term">Mid Term (Sessional)</option>
                            <option value="Final Term">Final Term (Exam)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Title (Optional)</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Quiz 1"
                            value={newAssessment.name} 
                            onChange={(e) => setNewAssessment({...newAssessment, name: e.target.value})} 
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none text-sm" 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Max Marks</label>
                            <input 
                                type="number" 
                                value={newAssessment.max} 
                                onChange={(e) => setNewAssessment({...newAssessment, max: e.target.value})} 
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none text-sm" 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Weightage (%)</label>
                            <input 
                                type="number" 
                                value={newAssessment.weight} 
                                onChange={(e) => setNewAssessment({...newAssessment, weight: e.target.value})} 
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none text-sm" 
                            />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button onClick={handleAddAssessmentSubmit} className="w-full px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                            <Plus size={18} /> Create Column
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
      
      {showManualEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#18181b] border border-white/10 rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-fade-in h-[85vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Manual Attendance</h3>
                        <p className="text-xs text-slate-400">Select date and mark attendance for {selectedClass?.name}</p>
                    </div>
                    <button onClick={() => setShowManualEntryModal(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
                </div>
                <div className="mb-6 flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Select Date</label>
                        <input 
                            type="date" 
                            value={manualDate} 
                            onChange={(e) => setManualDate(e.target.value)} 
                            onClick={(e) => e.target.showPicker && e.target.showPicker()} 
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none text-sm cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100" 
                        />
                    </div>
                    <div className="flex gap-2">
                         <button onClick={() => markAllManual('present')} className="px-4 py-3 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs hover:bg-emerald-600/20 transition-colors flex items-center gap-2"><CheckSquare size={16} /> Mark All Present</button>
                         <button onClick={() => markAllManual('absent')} className="px-4 py-3 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 font-bold text-xs hover:bg-rose-600/20 transition-colors flex items-center gap-2"><SquareIcon size={16} /> Unmark All</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="space-y-2">
                        {manualRoster.map(student => (
                            <div key={student.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${student.status === 'present' ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${student.status === 'present' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{student.name.charAt(0)}</div>
                                    <div><p className="text-sm font-bold text-white">{student.name}</p><p className="text-xs text-slate-500">{student.roll}</p></div>
                                </div>
                                <button onClick={() => toggleManualStatus(student.id)} className={`p-2 rounded-lg transition-colors ${student.status === 'present' ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-300'}`}>
                                    {student.status === 'present' ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="pt-6 border-t border-white/10 mt-4 flex justify-end">
                    <button onClick={submitManualAttendance} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2"><Save size={18} /> Save Attendance</button>
                </div>
            </div>
        </div>
      )}

      {/* IN-APP DOCUMENT VIEWER MODAL */}
      {viewingFile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 lg:p-10">
              <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-5xl h-full flex flex-col shadow-2xl animate-fade-in overflow-hidden">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40 shrink-0">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><FileText size={18} /></div>
                          <div>
                              <h3 className="text-sm font-bold text-white">Document Viewer</h3>
                              <p className="text-[10px] text-slate-500">Only PDFs and Images can be viewed inline.</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <a href={viewingFile} download className="text-xs font-bold text-slate-300 bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                              <Download size={14}/> Download 
                          </a>
                          <button onClick={() => setViewingFile(null)} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"><X size={18}/></button>
                      </div>
                  </div>
                  
                  <div className="flex-1 w-full bg-white relative">
                      {viewingFile.match(/\.(jpeg|jpg|gif|png|pdf)$/i) == null && (
                          <div className="absolute top-0 left-0 w-full bg-amber-500 text-black text-xs font-bold p-2 text-center z-10 shadow-md">
                              Note: Your browser may automatically download Word/Excel files instead of showing them here.
                          </div>
                      )}
                      <iframe 
                          src={viewingFile} 
                          className="w-full h-full border-0"
                          title="Document Viewer"
                      />
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}

export default LecturerDashboard;