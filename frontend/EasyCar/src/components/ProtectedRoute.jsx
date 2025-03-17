import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const userInfo = localStorage.getItem("token");

  // Redirect to login if user is not logged in
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected component
  return <Outlet />;
}
