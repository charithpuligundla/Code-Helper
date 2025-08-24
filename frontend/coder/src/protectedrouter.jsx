import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // Not logged in → redirect to login
    return <Navigate to="/" replace />;
  }

  return children; // logged in → show page
}

export default ProtectedRoute;