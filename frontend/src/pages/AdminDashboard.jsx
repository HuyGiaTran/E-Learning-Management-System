import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchUsers, createUser, updateUser, deleteUser } from '../redux/slices/usersSlice';
import {
  fetchMyCourses,
  createCourse,
  deleteCourse,
  updateCourse,
} from '../redux/slices/coursesSlice';
import { ROLES } from '../constants/roles';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { list: users, status: uStatus } = useAppSelector((s) => s.users);
  const { myList: courses } = useAppSelector((s) => s.courses);

  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: ROLES.STUDENT,
  });
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    instructorId: '',
    published: true,
  });
  const [msg, setMsg] = useState('');

  const teachers = useMemo(
    () => users.filter((u) => u.role === ROLES.TEACHER),
    [users]
  );

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchMyCourses());
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Admin</p>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Quản trị hệ thống</h1>
        <p className="mt-1 text-sm text-slate-600">
          Quản lý người dùng (mọi vai trò) và toàn bộ khóa học — gán giáo viên phụ trách khi tạo khóa.
        </p>
      </header>

      {msg ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800">
          {msg}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Tạo người dùng</h2>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setMsg('');
            const r = await dispatch(createUser(userForm));
            if (createUser.fulfilled.match(r)) {
              setMsg('Đã tạo người dùng.');
              setUserForm({ fullName: '', email: '', password: '', role: ROLES.STUDENT });
            } else setMsg(r.payload || 'Lỗi tạo người dùng');
          }}
        >
          <input
            required
            placeholder="Họ tên"
            className="min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
            value={userForm.fullName}
            onChange={(e) => setUserForm((f) => ({ ...f, fullName: e.target.value }))}
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
            value={userForm.email}
            onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            required
            type="password"
            placeholder="Mật khẩu"
            className="min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
            value={userForm.password}
            onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
          />
          <select
            className="min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
            value={userForm.role}
            onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value }))}
          >
            <option value={ROLES.STUDENT}>Học viên</option>
            <option value={ROLES.TEACHER}>Giáo viên</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </select>
          <button
            type="submit"
            className="min-h-[44px] rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700 sm:col-span-2"
          >
            Tạo tài khoản
          </button>
        </form>

        <h3 className="mt-8 text-sm font-semibold text-slate-800">Danh sách người dùng</h3>
        <div className="mt-2 overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Họ tên</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Vai trò</th>
                <th className="px-3 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {uStatus === 'loading' ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-slate-500">
                    Đang tải…
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-900">{u.fullName}</td>
                    <td className="px-3 py-2 text-slate-600">{u.email}</td>
                    <td className="px-3 py-2">
                      <select
                        className="max-w-[140px] rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        value={u.role}
                        onChange={async (e) => {
                          setMsg('');
                          const r = await dispatch(updateUser({ id: u.id, role: e.target.value }));
                          setMsg(updateUser.fulfilled.match(r) ? 'Đã cập nhật vai trò.' : r.payload || 'Lỗi');
                        }}
                      >
                        <option value={ROLES.STUDENT}>Học viên</option>
                        <option value={ROLES.TEACHER}>Giáo viên</option>
                        <option value={ROLES.ADMIN}>Admin</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="text-xs font-semibold text-rose-600 hover:underline"
                        onClick={async () => {
                          if (!confirm(`Xóa ${u.email}?`)) return;
                          setMsg('');
                          const r = await dispatch(deleteUser(u.id));
                          setMsg(deleteUser.fulfilled.match(r) ? 'Đã xóa.' : r.payload || 'Lỗi');
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Tạo khóa học</h2>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setMsg('');
            if (!courseForm.instructorId) {
              setMsg('Chọn giáo viên phụ trách.');
              return;
            }
            const r = await dispatch(
              createCourse({
                name: courseForm.name,
                description: courseForm.description,
                instructorId: courseForm.instructorId,
                published: courseForm.published,
              })
            );
            if (createCourse.fulfilled.match(r)) {
              setMsg('Đã tạo khóa học.');
              setCourseForm({ name: '', description: '', instructorId: '', published: true });
            } else setMsg(r.payload || 'Lỗi');
          }}
        >
          <input
            required
            placeholder="Tên khóa học"
            className="min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm sm:col-span-2"
            value={courseForm.name}
            onChange={(e) => setCourseForm((f) => ({ ...f, name: e.target.value }))}
          />
          <textarea
            placeholder="Mô tả"
            rows={2}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
            value={courseForm.description}
            onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))}
          />
          <select
            required
            className="min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm sm:col-span-2"
            value={courseForm.instructorId}
            onChange={(e) => setCourseForm((f) => ({ ...f, instructorId: e.target.value }))}
          >
            <option value="">— Giáo viên phụ trách —</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName} ({t.email})
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={courseForm.published}
              onChange={(e) => setCourseForm((f) => ({ ...f, published: e.target.checked }))}
            />
            Hiển thị / cho phép ghi danh
          </label>
          <button
            type="submit"
            className="min-h-[44px] rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 sm:col-span-2"
          >
            Tạo khóa học
          </button>
        </form>

        <h3 className="mt-8 text-sm font-semibold text-slate-800">Tất cả khóa học</h3>
        <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-100">
          {courses.map((c) => (
            <li
              key={c._id || c.id}
              className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">{c.name}</p>
                <p className="text-xs text-slate-500">
                  GV: {c.instructor?.fullName || '—'} ·{' '}
                  {c.published === false ? 'Ẩn' : 'Công khai'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium"
                  onClick={async () => {
                    const r = await dispatch(
                      updateCourse({
                        id: c._id || c.id,
                        published: !c.published,
                      })
                    );
                    setMsg(updateCourse.fulfilled.match(r) ? 'Đã cập nhật trạng thái.' : r.payload || 'Lỗi');
                  }}
                >
                  {c.published === false ? 'Mở' : 'Ẩn'}
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                  onClick={async () => {
                    if (!confirm('Xóa khóa học và toàn bộ bài học?')) return;
                    const r = await dispatch(deleteCourse(c._id || c.id));
                    setMsg(deleteCourse.fulfilled.match(r) ? 'Đã xóa khóa.' : r.payload || 'Lỗi');
                  }}
                >
                  Xóa khóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
