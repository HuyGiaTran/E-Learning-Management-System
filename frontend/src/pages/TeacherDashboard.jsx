import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchMyCourses, createCourse } from '../redux/slices/coursesSlice';

export default function TeacherDashboard() {
  const dispatch = useAppDispatch();
  const { myList: courses } = useAppSelector((s) => s.courses);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    dispatch(fetchMyCourses());
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Giáo viên</p>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Khóa học của tôi</h1>
        <p className="mt-1 text-sm text-slate-600">
          Tạo khóa học, thêm bài (Text/Video), tải SCORM, quản lý học viên ghi danh.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Tạo khóa học mới</h2>
        {msg ? <p className="mt-2 text-sm text-indigo-700">{msg}</p> : null}
        <form
          className="mt-4 flex flex-col gap-3 sm:max-w-xl"
          onSubmit={async (e) => {
            e.preventDefault();
            setMsg('');
            const r = await dispatch(createCourse({ name, description }));
            if (createCourse.fulfilled.match(r)) {
              setMsg('Đã tạo khóa học.');
              setName('');
              setDescription('');
            } else setMsg(r.payload || 'Lỗi');
          }}
        >
          <input
            required
            placeholder="Tên khóa học"
            className="min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            placeholder="Mô tả"
            rows={2}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            type="submit"
            className="min-h-[44px] rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Tạo khóa
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Danh sách</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {courses.length === 0 ? (
            <li className="text-sm text-slate-500">Chưa có khóa học.</li>
          ) : (
            courses.map((c) => {
              const id = c._id || c.id;
              return (
                <li key={id}>
                  <Link
                    to={`/teacher/courses/${id}`}
                    className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                  >
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{c.description || '—'}</p>
                    <p className="mt-2 text-xs font-medium text-indigo-600">Quản lý →</p>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </div>
  );
}
