import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  fetchCourse,
  clearCurrent,
  createLesson,
  deleteLesson,
  addStudentEmail,
  removeStudent,
} from '../redux/slices/coursesSlice';
import { uploadScormPackage } from '../lib/scormApi';
import { ROLES } from '../constants/roles';

export default function TeacherCoursePage() {
  const { courseId } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current: course } = useAppSelector((s) => s.courses);
  const { user } = useAppSelector((s) => s.auth);

  const [lessonForm, setLessonForm] = useState({
    title: '',
    type: 'Text',
    content: '',
  });
  const [email, setEmail] = useState('');
  const [scormTitle, setScormTitle] = useState('');
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!courseId) return;
    dispatch(fetchCourse(courseId))
      .unwrap()
      .catch(() => navigate('/teacher'));
    return () => {
      dispatch(clearCurrent());
    };
  }, [dispatch, courseId, navigate]);

  const cid = course?._id || course?.id;
  const isInstructor =
    course &&
    user &&
    String(course.instructor?._id || course.instructor) === String(user.id);
  const canManage = user?.role === ROLES.ADMIN || isInstructor;

  if (!course && courseId) {
    return <p className="text-slate-600">Đang tải khóa học…</p>;
  }

  if (course && !canManage) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Bạn không phải giáo viên phụ trách khóa này.{' '}
        <button type="button" className="font-semibold underline" onClick={() => navigate('/teacher')}>
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/teacher" className="text-sm font-semibold text-indigo-600 hover:underline">
            ← Danh sách khóa
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{course?.name}</h1>
          <p className="text-sm text-slate-600">{course?.description || '—'}</p>
        </div>
      </div>

      {msg ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm">{msg}</div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Thêm bài Text / Video</h2>
        <form
          className="mt-4 grid max-w-xl gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setMsg('');
            const r = await dispatch(
              createLesson({
                courseId: cid,
                title: lessonForm.title,
                type: lessonForm.type,
                content: lessonForm.content,
              })
            );
            if (createLesson.fulfilled.match(r)) {
              setMsg('Đã thêm bài học.');
              setLessonForm({ title: '', type: 'Text', content: '' });
            } else setMsg(r.payload || 'Lỗi');
          }}
        >
          <input
            required
            placeholder="Tiêu đề"
            className="min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
            value={lessonForm.title}
            onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
          />
          <select
            className="min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
            value={lessonForm.type}
            onChange={(e) => setLessonForm((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="Text">Text</option>
            <option value="Video">Video (URL)</option>
          </select>
          <textarea
            required
            placeholder="Nội dung hoặc URL video"
            rows={3}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={lessonForm.content}
            onChange={(e) => setLessonForm((f) => ({ ...f, content: e.target.value }))}
          />
          <button
            type="submit"
            className="min-h-[44px] rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white"
          >
            Thêm bài
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Tải gói SCORM (.zip)</h2>
        <form
          className="mt-4 flex max-w-xl flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!file) {
              setMsg('Chọn file zip.');
              return;
            }
            setMsg('Đang tải lên…');
            try {
              await uploadScormPackage({ courseId: cid, file, title: scormTitle || undefined });
              setMsg('Đã nhập SCORM. Đang làm mới…');
              setFile(null);
              setScormTitle('');
              await dispatch(fetchCourse(courseId));
            } catch (err) {
              setMsg(err.message || 'Lỗi upload');
            }
          }}
        >
          <input
            type="file"
            accept=".zip,application/zip"
            className="text-sm"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <input
            placeholder="Tiêu đề bài (tuỳ chọn)"
            className="min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
            value={scormTitle}
            onChange={(e) => setScormTitle(e.target.value)}
          />
          <button type="submit" className="min-h-[44px] rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white">
            Upload SCORM
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Học viên trong khóa</h2>
        <form
          className="mt-3 flex max-w-xl flex-col gap-2 sm:flex-row"
          onSubmit={async (e) => {
            e.preventDefault();
            setMsg('');
            const r = await dispatch(addStudentEmail({ courseId: cid, email }));
            if (addStudentEmail.fulfilled.match(r)) {
              setMsg('Đã thêm học viên.');
              setEmail('');
            } else setMsg(r.payload || 'Lỗi');
          }}
        >
          <input
            type="email"
            required
            placeholder="Email học viên"
            className="min-h-[44px] flex-1 rounded-xl border border-slate-200 px-3 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="min-h-[44px] rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white">
            Thêm
          </button>
        </form>
        <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">
          {(course?.students || []).map((s) => (
            <li key={s._id || s.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <span>
                {s.fullName} <span className="text-slate-500">({s.email})</span>
              </span>
              <button
                type="button"
                className="text-xs font-semibold text-rose-600"
                onClick={async () => {
                  const r = await dispatch(
                    removeStudent({ courseId: cid, studentId: s._id || s.id })
                  );
                  setMsg(removeStudent.fulfilled.match(r) ? 'Đã gỡ học viên.' : r.payload || 'Lỗi');
                }}
              >
                Gỡ
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Bài học</h2>
        <ul className="mt-3 space-y-2">
          {(course?.lessons || []).map((l) => {
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
                <div className="flex flex-wrap gap-2">
                  {l.type === 'SCORM' && l.content ? (
                    <Link
                      to={`/learn/${encodeURIComponent(lid)}`}
                      state={{ launchPath: l.content, title: l.title }}
                      className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                    >
                      Mở SCORM
                    </Link>
                  ) : null}
                  {l.type !== 'SCORM' ? (
                    <Link
                      to={`/lesson/${encodeURIComponent(lid)}`}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800"
                    >
                      Xem bài
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                    onClick={async () => {
                      if (!confirm('Xóa bài này?')) return;
                      const r = await dispatch(deleteLesson(lid));
                      setMsg(deleteLesson.fulfilled.match(r) ? 'Đã xóa bài.' : r.payload || 'Lỗi');
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
