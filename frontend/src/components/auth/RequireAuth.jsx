import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchMe, hydrateToken } from '../../redux/slices/authSlice';
import { getStoredToken } from '../../hooks/useAuthToken';

export default function RequireAuth() {
  const dispatch = useAppDispatch();
  const { user, token, status } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(hydrateToken());
  }, [dispatch]);

  useEffect(() => {
    if (getStoredToken() && !user && status !== 'loading') {
      dispatch(fetchMe());
    }
  }, [dispatch, user, status]);

  if (!getStoredToken() && !token) {
    return <Navigate to="/login" replace />;
  }

  if ((getStoredToken() || token) && !user) {
    if (status === 'loading' || status === 'idle') {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-6 text-slate-600">
          Đang tải phiên đăng nhập…
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
