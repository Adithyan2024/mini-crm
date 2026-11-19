import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user && localStorage.getItem('token') ? children : <Navigate to="/login" replace />;
}
