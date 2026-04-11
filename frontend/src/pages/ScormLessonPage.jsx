import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import ScormPlayer from '../components/scorm/ScormPlayer';

export default function ScormLessonPage() {
  const { lessonId } = useParams();
  const location = useLocation();
  const fromState = location.state || {};

  const [launchPath, setLaunchPath] = useState(fromState.launchPath || '');
  const [title, setTitle] = useState(fromState.title || '');

  const decodedId = useMemo(() => (lessonId ? decodeURIComponent(lessonId) : ''), [lessonId]);

  const canPlay = Boolean(decodedId && launchPath);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/dashboard"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-indigo-700 hover:text-indigo-900"
        >
          ← Quay lại bảng điều khiển
        </Link>
      </div>

      {!fromState.launchPath ? (
        <div className="max-w-xl space-y-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5">
          <p className="text-sm font-medium text-amber-950">
            Mở bài từ Dashboard (nút &quot;Học bài&quot;) để tự điền đường dẫn. Hoặc nhập thủ công:
          </p>
          <label className="block text-xs font-semibold text-slate-700">
            Đường dẫn SCORM (iframe)
            <input
              className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              value={launchPath}
              onChange={(e) => setLaunchPath(e.target.value)}
              placeholder="/scorm-content/.../index.html"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            Tiêu đề
            <input
              className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tên bài"
            />
          </label>
        </div>
      ) : null}

      {canPlay ? (
        <ScormPlayer lessonId={decodedId} launchPath={launchPath} title={title} />
      ) : (
        <p className="text-sm text-slate-600">
          Nhập <strong>launchPath</strong> (đường dẫn tương đối từ cùng origin dev, thường bắt đầu bằng{' '}
          <code className="rounded bg-slate-100 px-1">/scorm-content/</code>) để tải gói đã giải nén.
        </p>
      )}
    </div>
  );
}
