import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}