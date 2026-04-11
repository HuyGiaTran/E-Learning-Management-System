import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchMyCourses, fetchDiscover, enrollCourse, unenrollCourse } from '../redux/slices/coursesSlice';

export default function StudentDashboard() {
  const dispatch = useAppDispatch();
  const { myList, discoverList } = useAppSelector((s) => s.courses);
  const { user } = useAppSelector((s) => s.auth);
  const [tab, setTab] = useState('mine');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    dispatch(fetchMyCourses());
    dispatch(fetchDiscover());
  }, [dispatch]);

  const refresh = async () => {
    await dispatch(fetchMyCourses());
    await dispatch(fetchDiscover());
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Học viên</p>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Lớp học của tôi</h1>
        <p className="mt-1 text-sm text-slate-600">
          Xin chào <strong>{user?.fullName}</strong>. Ghi danh khóa mới ở tab Khám phá, theo dõi bài trong từng
          khóa học.
        </p>
      </header>

      {msg ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800">{msg}</div>
      ) : null}

      <div className="flex gap-2 rounded-xl bg-slate-100 p-1 sm:inline-flex">
        <button
          type="button"
          className={`min-h-[44px] flex-1 rounded-lg px-4 text-sm font-semibold sm:flex-none ${
            tab === 'mine' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
          }`}
          onClick={() => setTab('mine')}
        >
          Khóa đã ghi danh
        </button>
        <button
          type="button"
          className={`min-h-[44px] flex-1 rounded-lg px-4 text-sm font-semibold sm:flex-none ${
            tab === 'discover' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
          }`}
          onClick={() => setTab('discover')}
        >
          Khám phá
        </button>
      </div>

      {tab === 'mine' ? (
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Đang học</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {myList.length === 0 ? (
              <li className="text-sm text-slate-500">Chưa ghi danh khóa nào — hãy mở tab Khám phá.</li>
            ) : (
              myList.map((c) => {
                const id = c._id || c.id;
                return (
                  <li key={id}>
                    <Link
                      to={`/student/courses/${id}`}
                      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200"
                    >
                      <p className="font-semibold text-slate-900">{c.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">{c.description || '—'}</p>
                      <p className="mt-2 text-xs font-medium text-emerald-600">Vào học →</p>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </section>
      ) : (
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Khóa đang mở ghi danh</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {discoverList
              .filter((c) => c.published !== false)
              .map((c) => {
                const id = c._id || c.id;
                return (
                  <li
                    key={id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      GV: {c.instructor?.fullName || '—'}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{c.description || ''}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {c.isEnrolled ? (
                        <>
                          <Link
                            to={`/student/courses/${id}`}
                            className="inline-flex min-h-[40px] items-center rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white"
                          >
                            Vào khóa
                          </Link>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium"
                            onClick={async () => {
                              setMsg('');
                              const r = await dispatch(unenrollCourse(id));
                              setMsg(unenrollCourse.fulfilled.match(r) ? 'Đã huỷ ghi danh.' : r.payload || 'Lỗi');
                              await refresh();
                            }}
                          >
                            Huỷ ghi danh
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="min-h-[40px] rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white"
                          onClick={async () => {
                            setMsg('');
                            const r = await dispatch(enrollCourse(id));
                            if (enrollCourse.fulfilled.match(r)) {
                              setMsg('Ghi danh thành công.');
                              await refresh();
                            } else setMsg(r.payload || 'Lỗi');
                          }}
                        >
                          Ghi danh
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      )}
    </div>
  );
}
