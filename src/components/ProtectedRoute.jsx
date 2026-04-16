import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // Not logged in at all → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is provided, check role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user is logged in but role not allowed, send them to their home
    if (user.role === "student") return <Navigate to="/student" replace />;
    if (user.role === "lecturer") return <Navigate to="/lecturer" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
