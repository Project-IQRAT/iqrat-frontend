import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// ==========================================
// 1. ASSETS & UTILS
// ==========================================
import defaultLogoImg from "../assets/iqrat-logo.png";
import { decodeJWT, formatImageUrl } from "../components/shared/utils.jsx";
import { QrCode } from "lucide-react"; 

// ==========================================
// 2. CHILD COMPONENTS & VIEWS
// ==========================================
import { StudentSidebar } from "../components/student/StudentSidebar.jsx";
import { StudentHeader } from "../components/student/StudentHeader.jsx";
import { HomeContent } from "../components/student/HomeContent.jsx";
import { LeaderboardView } from "../components/student/LeaderboardView.jsx";
import { TimetableView } from "../components/student/TimetableView.jsx";
import { GradesView } from "../components/student/GradesView.jsx";
import { AttendanceHistoryView } from "../components/student/AttendanceHistoryView.jsx";
import { CoursesView } from "../components/student/CoursesView.jsx";
import { ProfileView } from "../components/student/ProfileView.jsx";

// ==========================================
// 3. GLOBAL STYLES
// ==========================================
const GlobalStyles = () => (
  <style>{`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    /* Dynamic Theme Overrides */
    .theme-dark_gold { border-color: #fbbf24 !important; box-shadow: 0 0 20px rgba(251, 191, 36, 0.1); }
    .theme-neon_cyber { border-color: #2dd4bf !important; box-shadow: 0 0 20px rgba(45, 212, 191, 0.15); }
  `}</style>
);


function StudentDashboard() {
  const navigate = useNavigate();
  const { logout, token } = useAuth(); 
  
  // FIX: Fetch token from localStorage on reload to prevent data loss!
  const currentToken = token || localStorage.getItem("token");

  // ==========================================
  // 4. UI & NAVIGATION STATE
  // ==========================================
  const [activeTab, setActiveTab] = useState("home");
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // ==========================================
  // 5. DATA STATE (Profile, Stats, Grades, etc.)
  // ==========================================
  const [profile, setProfile] = useState({ name: "Loading...", roll: "Authenticating...", email: "", program: "BS Computer Science", semester: "Current Semester" });
  const [userPhoto, setUserPhoto] = useState(defaultLogoImg); 
  const [fullProfileSettings, setFullProfileSettings] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
      xp_points: 0, level: 1, badge: "Novice Learner", current_streak: 0, avg_attendance: 0, rank: 1, top_10_students: [], current_mood: "focused"
  });
  
  const [subjects, setSubjects] = useState([]); 
  const [timetableData, setTimetableData] = useState([]);
  const [nextClass, setNextClass] = useState({ subject: "No Class Scheduled", code: "---", time: "---", room: "---" });
  const [attendanceHistory, setAttendanceHistory] = useState([]); 
  const [gradesData, setGradesData] = useState([]); 
  const [notificationsList, setNotificationsList] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);

  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingTimetable, setIsLoadingTimetable] = useState(true);

  // ==========================================
  // 6. VIEW-SPECIFIC STATE
  // ==========================================
  const [selectedAttendanceSubject, setSelectedAttendanceSubject] = useState(0);
  const [selectedGradeSubject, setSelectedGradeSubject] = useState(0); 
  
  const [viewingCourse, setViewingCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState({ materials: [], announcements: [] });
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [showSubmitModal, setShowSubmitModal] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived variable for avatar/dashboard logic
  const mood = dashboardStats.current_mood || "focused";

  // ==========================================
  // 7. EFFECTS (API Calls & Event Listeners)
  // ==========================================
  
  // Handle click outside to close notifications
  useEffect(() => {
      function handleClickOutside(event) { 
          if (notifRef.current && !notifRef.current.contains(event.target)) {
              setShowNotifications(false); 
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Decode JWT and set basic profile
  useEffect(() => {
      if (currentToken) {
          const decoded = decodeJWT(currentToken);
          if (decoded) {
              setProfile(prev => ({
                  ...prev,
                  name: decoded.name || "Student",
                  roll: decoded.roll || "N/A",
                  email: decoded.sub 
              }));
              if (decoded.photo && userPhoto === defaultLogoImg) setUserPhoto(formatImageUrl(decoded.photo));
          }
      }
  }, [currentToken, userPhoto]);

  // Fetch Main Dashboard Data
  useEffect(() => {
      const fetchMyData = async () => {
          if (!profile.email || !currentToken) return;
          try {
              setIsLoadingCourses(true);
              const headers = { "Authorization": `Bearer ${currentToken}` };
              const [crsRes, histRes, statsRes, gradesRes, profRes, notifRes, aiRes] = await Promise.all([
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/courses?email=${profile.email}`, { headers }),
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/attendance?email=${profile.email}`, { headers }),
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/dashboard-stats?email=${profile.email}`, { headers }),
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/grades?email=${profile.email}`, { headers }),
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/profile?email=${profile.email}`, { headers }),
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/notifications?email=${profile.email}`, { headers }),
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/predictions?email=${profile.email}`, { headers })
              ]);

              if (crsRes.ok && histRes.ok) {
                  const rawCourses = await crsRes.json();
                  const histData = await histRes.json();
                  const updatedCourses = rawCourses.map(course => {
                      const courseLogs = histData.filter(log => log.subject_code === course.code);
                      const presents = courseLogs.filter(log => log.status === 'Present').length;
                      const absents = courseLogs.filter(log => log.status === 'Absent').length;
                      const leaves = courseLogs.filter(log => log.status === 'Leave' || log.status === 'Late').length;
                      const totalHeld = presents + absents + leaves;
                      const attendancePct = totalHeld > 0 ? Math.round((presents / totalHeld) * 100) : 0;
                      return { ...course, presents, absents, leaves, totalHeld, attendance: attendancePct };
                  });
                  setSubjects(updatedCourses);
                  setAttendanceHistory(histData);
              }

              if (statsRes.ok) setDashboardStats(await statsRes.json());
              if (profRes.ok) {
                  const pData = await profRes.json();
                  setFullProfileSettings(pData);
                  if (pData.photo_path) setUserPhoto(formatImageUrl(pData.photo_path));
              }
              if (aiRes.ok) setAiPredictions(await aiRes.json());

              let dynamicNotifs = [];
              if (gradesRes.ok) {
                  const grades = await gradesRes.json();
                  setGradesData(grades);
                  grades.forEach(sub => {
                      if(sub.assessments) {
                          sub.assessments.forEach(ass => {
                              if (ass.status !== "Submitted" && ass.status !== "Graded" && ass.deadline) {
                                  const deadlineDate = new Date(ass.deadline);
                                  deadlineDate.setHours(23, 59, 59); 
                                  const diffHours = (deadlineDate - new Date()) / (1000 * 60 * 60);
                                  
                                  if (diffHours > 0 && diffHours <= 24) {
                                      dynamicNotifs.push({
                                          id: `deadline_${ass.id}`, type: 'Alert',
                                          title: `Due Tomorrow: ${ass.name}`,
                                          message: `Your ${ass.category} for ${sub.subject_code} is due soon!`,
                                          is_read: false, time: "Urgent"
                                      });
                                  }
                              }
                          });
                      }
                  });
              }

              let dbNotifs = notifRes.ok ? await notifRes.json() : [];
              setNotificationsList([...dynamicNotifs, ...dbNotifs]);

          } catch (error) {
              console.error("Error fetching data:", error);
          } finally {
              setIsLoadingCourses(false);
          }
      };
      fetchMyData();
  }, [profile.email, currentToken]);

  // Fetch Timetable Data
  useEffect(() => {
      const fetchMyTimetable = async () => {
          if (!profile.email || !currentToken) return;
          try {
              setIsLoadingTimetable(true);
              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/timetable?email=${profile.email}`, {
                  headers: { "Authorization": `Bearer ${currentToken}` }
              });
              if (res.ok) {
                  const rawData = await res.json();
                  const grouped = rawData.reduce((acc, slot) => {
                      const dayObj = acc.find(d => d.day === slot.day);
                      if (dayObj) dayObj.classes.push(slot);
                      else acc.push({ day: slot.day, classes: [slot] });
                      return acc;
                  }, []);

                  const dayOrder = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7 };
                  grouped.sort((a, b) => dayOrder[a.day] - dayOrder[b.day]);
                  grouped.forEach(dayObj => dayObj.classes.sort((a, b) => new Date('1970/01/01 ' + a.start) - new Date('1970/01/01 ' + b.start)));

                  setTimetableData(grouped);

                  if (rawData.length > 0) {
                      const now = new Date();
                      const todayStr = now.toLocaleDateString('en-US', { weekday: 'long' });
                      const todaysClasses = rawData.filter(c => c.day === todayStr);
                      
                      let upcoming = todaysClasses.length > 0 ? todaysClasses[0] : rawData[0];
                      setNextClass({ subject: upcoming.subject, code: upcoming.code, time: `${upcoming.day} • ${upcoming.start}`, room: upcoming.room });

                      for (const cls of todaysClasses) {
                          const [h, m] = cls.start.split(':').map(Number);
                          const classTime = new Date();
                          classTime.setHours(h, m, 0, 0);
                          
                          const diffMins = (classTime - now) / (1000 * 60);
                          
                          if (diffMins <= 15 && diffMins >= -15) {
                              setNotificationsList(prev => [{
                                  id: 'next_class_live', type: 'schedule',
                                  title: `Class Starting: ${cls.subject} (${cls.code})`,
                                  message: `${cls.room} • Starts at ${cls.start}`,
                                  is_read: false, time: "Live Now"
                              }, ...prev.filter(n => n.id !== 'next_class_live')]);
                              break;
                          }
                      }
                  }
              }
          } catch (error) {
              console.error("Error fetching timetable:", error);
          } finally {
              setIsLoadingTimetable(false);
          }
      };
      fetchMyTimetable();
  }, [profile.email, currentToken]);

  // Fetch Course Materials & Announcements
  useEffect(() => {
      if (!viewingCourse || !viewingCourse.offering_id) return;
      const fetchDetails = async () => {
          setIsLoadingDetails(true);
          try {
              const [matRes, annRes] = await Promise.all([
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/offerings/${viewingCourse.offering_id}/materials`, { headers: { Authorization: `Bearer ${currentToken}` } }),
                  fetch(`${import.meta.env.VITE_API_URL}/api/v1/academic/offerings/${viewingCourse.offering_id}/announcements`, { headers: { Authorization: `Bearer ${currentToken}` } })
              ]);
              
              const materials = matRes.ok ? await matRes.json() : [];
              const announcements = annRes.ok ? await annRes.json() : [];
              
              setCourseDetails({ materials, announcements });
          } catch (err) {
              console.error(err);
          } finally {
              setIsLoadingDetails(false);
          }
      };
      fetchDetails();
  }, [viewingCourse, currentToken]);


  // ==========================================
  // 8. EVENT HANDLERS
  // ==========================================
  const handleBellClick = async () => {
      const newState = !showNotifications;
      setShowNotifications(newState);

      if (newState) {
          const unreadDbIds = notificationsList
              .filter(n => !n.is_read && typeof n.id === 'number')
              .map(n => n.id);

          if (unreadDbIds.length > 0) {
              try {
                  await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/notifications/read`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentToken}` },
                      body: JSON.stringify({ notification_ids: unreadDbIds })
                  });
                  setNotificationsList(prev => prev.map(n => typeof n.id === 'number' ? { ...n, is_read: true } : n));
              } catch (e) { console.error(e); }
          }
      }
  };

  const handleAssignmentSubmit = async () => {
      if (!submissionFile) return alert("Please attach your assignment file first.");
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append("email", profile.email);
      formData.append("assessment_id", showSubmitModal.id);
      formData.append("file", submissionFile);

      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/me/submit-assignment`, {
              method: "POST",
              headers: { "Authorization": `Bearer ${currentToken}` }, 
              body: formData
          });
          const data = await res.json();
          if (res.ok) {
              alert("✅ Assignment submitted successfully!");
              setGradesData(prev => prev.map(subject => ({
                  ...subject,
                  assessments: subject.assessments.map(ass => 
                      ass.id === showSubmitModal.id ? { ...ass, status: "Submitted" } : ass
                  )
              })));
              setShowSubmitModal(null);
              setSubmissionFile(null);
          } else {
              alert(`❌ Error: ${data.detail}`);
          }
      } catch (err) {
          console.error(err);
          alert("Network error while submitting.");
      } finally {
          setIsSubmitting(false);
      }
  };
  
  const handleLogout = () => { 
      localStorage.removeItem("token");
      logout(); 
      setTimeout(() => navigate("/"), 10); 
  };


  // ==========================================
  // 9. MAIN RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-[#000000] text-slate-300 font-sans selection:bg-indigo-500/30 flex flex-col h-[100dvh] overflow-hidden">
      <GlobalStyles />
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] opacity-30"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] opacity-30"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      {/* Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] cursor-pointer transition-opacity duration-200 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setDrawerOpen(false)}
      />

      {/* Extracted Sidebar */}
      <StudentSidebar 
          isDrawerOpen={isDrawerOpen} 
          setDrawerOpen={setDrawerOpen} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          handleLogout={handleLogout} 
      />

      {/* Extracted Header */}
      <StudentHeader 
          activeTab={activeTab}
          profile={profile}
          setDrawerOpen={setDrawerOpen}
          handleBellClick={handleBellClick}
          notificationsList={notificationsList}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          userPhoto={userPhoto}
          setActiveTab={setActiveTab}
          notifRef={notifRef}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1 p-4 lg:p-6 relative z-10 overflow-x-hidden overflow-y-auto scroll-smooth scrollbar-hide flex flex-col">
        <div className="max-w-7xl mx-auto w-full">
          {activeTab === "home" && (
            <HomeContent 
                isLoadingCourses={isLoadingCourses}
                profile={profile}
                mood={mood}
                dashboardStats={dashboardStats}
                aiPredictions={aiPredictions}
                subjects={subjects}
                nextClass={nextClass}
            />
          )}
          {activeTab === "courses" && (
            <CoursesView 
                isLoadingCourses={isLoadingCourses}
                viewingCourse={viewingCourse}
                setViewingCourse={setViewingCourse}
                isLoadingDetails={isLoadingDetails}
                courseDetails={courseDetails}
                subjects={subjects}
                formatImageUrl={formatImageUrl}
            />
            )}
          {activeTab === "attendance" && (
            <AttendanceHistoryView 
                subjects={subjects}
                selectedAttendanceSubject={selectedAttendanceSubject}
                setSelectedAttendanceSubject={setSelectedAttendanceSubject}
                attendanceHistory={attendanceHistory}
            />
          )}
          {activeTab === "leaderboard" && <LeaderboardView dashboardStats={dashboardStats} />}
          {activeTab === "timetable" && <TimetableView isLoadingTimetable={isLoadingTimetable} timetableData={timetableData} />}
          {activeTab === "profile" && (
            <ProfileView 
                profile={profile}
                setProfile={setProfile}
                userPhoto={userPhoto}
                setUserPhoto={setUserPhoto}
                fullProfileSettings={fullProfileSettings}
                dashboardStats={dashboardStats}
                currentToken={currentToken}
                setActiveTab={setActiveTab}
            />
          )}
          {activeTab === "grades" && (
            <GradesView 
                gradesData={gradesData}
                selectedGradeSubject={selectedGradeSubject}
                setSelectedGradeSubject={setSelectedGradeSubject}
                showSubmitModal={showSubmitModal}
                setShowSubmitModal={setShowSubmitModal}
                submissionFile={submissionFile}
                setSubmissionFile={setSubmissionFile}
                isSubmitting={isSubmitting}
                handleAssignmentSubmit={handleAssignmentSubmit}
                formatImageUrl={formatImageUrl}
            />
            )}
        </div>
      </main>

      {/* Floating Action Button (Mobile) */}
      <button onClick={() => navigate("/student/scan")} className="lg:hidden md:hidden fixed bottom-8 right-6 z-50 w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-[0_0_40px_rgba(79,70,229,0.5)] border border-white/20 hover:scale-105 active:scale-95 transition-transform animate-bounce-slow group">
         <QrCode className="w-8 h-8 group-hover:scale-110 transition-transform" />
         <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-black"></span>
         </span>
      </button>

    </div>
  );
}

export default StudentDashboard;