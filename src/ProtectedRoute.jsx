import { Navigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
  // get the global auth state from context
  const { user, loading } = useAuth();

  // if Firebase is still checking if someone is logged in,
  // don’t do anything yet — just wait
  // because the state changes when the user object has been added, loading will be set to false and this component will rerender
  if (loading) {
    return <p>Checking authentication...</p>;
  }

  // if loading is finished and there is NO user,
  // it means nobody is logged in, so send them to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // if we reach here, loading is false and user exists,
  // so allow access to whatever route is inside this
  return <Outlet />;
}