import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isAuthorized = localStorage.getItem("isAuthorized") === "true";

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
