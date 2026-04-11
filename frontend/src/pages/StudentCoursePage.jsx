import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchCourse, clearCurrent, unenrollCourse } from '../redux/slices/coursesSlice';
import { ROLES } from '../constants/roles';

export default function StudentCoursePage() {
  const { courseId } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current: course } = useAppSelector((s) => s.courses);
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!courseId) return;
    dispatch(fetchCourse(courseId))
      .unwrap()
      .catch(() => navigate('/student'));
    return () => dispatch(clearCurrent());
  }, [dispatch, courseId, navigate]);

  if (!course) {
    return <p className="text-slate-600">Đang tải…</p>;
  }

  const canAccess = course.isEnrolled || user?.role === ROLES.ADMIN;

  if (!canAccess) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
        Bạn chưa ghi danh khóa này.{' '}
        <Link className="font-semibold text-indigo-700 underline" to="/student">
          Về trang học viên
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/student" className="text-sm font-semibold text-emerald-600 hover:underline">
          ← Trang học viên
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{course.name}</h1>
        <p className="text-sm text-slate-600">{course.description || '—'}</p>
        <button
          type="button"
          className="mt-3 text-xs font-semibold text-rose-600 hover:underline"
          onClick={async () => {
            if (!confirm('Huỷ ghi danh khóa này?')) return;
            await dispatch(unenrollCourse(course._id || course.id));
            navigate('/student');
          }}
        >
          Huỷ ghi danh
        </button>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Bài học</h2>
        <ul className="mt-3 space-y-2">
          {(course.lessons || []).map((l) => {
            const lid = l._id || l.id;
            return (
              <li
                key={lid}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{l.title}</p>
                  <p className="text-xs text-slate-500">{l.type}</p>
                </div>
                <div>
                  {l.type === 'SCORM' && l.content ? (
                    <Link
                      to={`/learn/${encodeURIComponent(lid)}`}
                      state={{ launchPath: l.content, title: l.title }}
                      className="inline-flex min-h-[40px] items-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white"
                    >
                      Học SCORM
                    </Link>
                  ) : null}
                  {l.type !== 'SCORM' ? (
                    <Link
                      to={`/lesson/${encodeURIComponent(lid)}`}
                      className="inline-flex min-h-[40px] items-center rounded-lg bg-slate-800 px-4 text-sm font-semibold text-white"
                    >
                      Mở bài
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
