import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { token, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  if (isLoading && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        🔐 Checking authentication...
      </div>
    );
  }

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!token) {
   localStorage.clear();
   return <Navigate to="/login" replace />;
  }


  return children;
};

export default ProtectedRoute;
