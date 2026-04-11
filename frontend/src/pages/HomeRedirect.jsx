import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { ROLE_HOME } from '../constants/roles';

export default function HomeRedirect() {
  const { user } = useAppSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  const to = ROLE_HOME[user.role] || '/student';
  return <Navigate to={to} replace />;
}
