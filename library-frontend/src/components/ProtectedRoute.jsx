import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requireAdmin }) {
  const storedUser = localStorage.getItem('user');

  // 1. If there is no user logged in at all, kick them to the login page
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(storedUser);

  // 2. If the route requires an admin, but the user is NOT an admin, kick them to home
  // (Adjust 'user.role' to whatever column name you use in your database, e.g., user.is_admin)
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // 3. If they pass the checks, let them in!
  return children;
}