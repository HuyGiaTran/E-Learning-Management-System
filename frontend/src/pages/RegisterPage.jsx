import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { register } from '../redux/slices/authSlice';
import { ROLE_HOME } from '../constants/roles';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, status, error } = useAppSelector((s) => s.auth);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) navigate(ROLE_HOME[user.role] || '/student', { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const r = await dispatch(register({ fullName, email, password }));
    if (register.fulfilled.match(r)) {
      const u = r.payload.user;
      navigate(ROLE_HOME[u.role] || '/student', { replace: true });
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold text-slate-900">Đăng ký học viên</h1>
        <p className="mt-1 text-sm text-slate-600">
          Tài khoản mới luôn là vai trò <strong>Học viên</strong>. Giáo viên / Admin do quản trị viên tạo.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {error ? (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</div>
          ) : null}
          <label className="block text-sm font-medium text-slate-700">
            Họ và tên
            <input
              required
              className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 px-3 py-2 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              required
              className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 px-3 py-2 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Mật khẩu (≥ 6 ký tự)
            <input
              type="password"
              required
              minLength={6}
              className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 px-3 py-2 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="min-h-[48px] w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {status === 'loading' ? 'Đang tạo…' : 'Đăng ký'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Đã có tài khoản?{' '}
          <Link className="font-semibold text-indigo-600 hover:underline" to="/login">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
