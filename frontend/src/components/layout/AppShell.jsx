import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import { ROLES, ROLE_HOME } from '../../constants/roles';

const navClass = ({ isActive }) =>
  [
    'rounded-xl px-3 py-2 text-sm font-medium transition-colors min-h-[44px] inline-flex items-center justify-center',
    isActive
      ? 'bg-indigo-600 text-white shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
  ].join(' ');

export default function AppShell() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);

  const home = user ? ROLE_HOME[user.role] || '/student' : '/login';

  const links = [];
  if (user?.role === ROLES.ADMIN) {
    links.push({ to: '/admin', label: 'Admin' });
  }
  if (user?.role === ROLES.TEACHER) {
    links.push({ to: '/teacher', label: 'Giáo viên' });
  }
  if (user?.role === ROLES.STUDENT) {
    links.push({ to: '/student', label: 'Học viên' });
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link to={home} className="text-base font-semibold text-slate-900 sm:text-lg tracking-tight">
              LMS <span className="text-indigo-600">E-Learning</span>
            </Link>
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 underline sm:hidden"
              onClick={() => {
                dispatch(logout());
                navigate('/login');
              }}
            >
              Đăng xuất
            </button>
          </div>
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2" aria-label="Điều hướng chính">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={navClass}>
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <span className="hidden px-2 text-xs text-slate-500 sm:inline max-w-[140px] truncate" title={user.email}>
                {user.fullName}
              </span>
            ) : null}
            <button
              type="button"
              className="hidden min-h-[44px] rounded-xl px-3 text-sm font-medium text-rose-700 hover:bg-rose-50 sm:inline"
              onClick={() => {
                dispatch(logout());
                navigate('/login');
              }}
            >
              Đăng xuất
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-slate-500 sm:px-6">
          Responsive — Mobile &amp; Tablet. Vai trò: Admin · Giáo viên · Học viên.
        </div>
      </footer>
    </div>
  );
}
