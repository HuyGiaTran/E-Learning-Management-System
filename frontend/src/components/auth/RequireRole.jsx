import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import { ROLE_HOME } from '../../constants/roles';

export default function RequireRole({ roles }) {
  const { user } = useAppSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    const home = ROLE_HOME[user.role] || '/student';
    return <Navigate to={home} replace />;
  }
  return <Outlet />;
}
