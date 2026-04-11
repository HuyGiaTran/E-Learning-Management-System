import { Link } from 'react-router-dom';
import { useLessonProgressPercent } from '../../hooks/useLessonProgressPercent';

function StatusPill({ status }) {
  const s = String(status || 'not attempted').toLowerCase();
  const map = {
    passed: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
    completed: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
    failed: 'bg-rose-100 text-rose-800 ring-rose-600/20',
    incomplete: 'bg-amber-100 text-amber-900 ring-amber-600/20',
    browsed: 'bg-sky-100 text-sky-900 ring-sky-600/20',
    'not attempted': 'bg-slate-100 text-slate-700 ring-slate-600/10',
  };
  const cls = map[s] || 'bg-slate-100 text-slate-700 ring-slate-600/10';
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      <span className="truncate">{status || 'not attempted'}</span>
    </span>
  );
}

export default function ProgressCard({ lesson, progress }) {
  const pct = useLessonProgressPercent(progress?.lessonStatus, progress?.scoreRaw);
  const score = progress?.scoreRaw === '' || progress?.scoreRaw == null ? '—' : progress.scoreRaw;

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-900/5 sm:p-5">
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-snug text-slate-900 sm:text-lg">
            {lesson.title}
          </h3>
          {lesson.isDemo ? (
            <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Demo
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={progress?.lessonStatus} />
          {progress?.loading ? (
            <span className="text-xs text-slate-500">Đang tải CMI…</span>
          ) : null}
          {progress?.error ? (
            <span className="text-xs text-rose-600" title={progress.error}>
              Lỗi tải tiến độ
            </span>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tiến độ ước lượng</span>
            <span className="font-semibold text-slate-800">{pct}%</span>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tiến độ học tập"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt className="text-xs text-slate-500">Điểm (raw)</dt>
            <dd className="font-semibold text-slate-900">{score}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt className="text-xs text-slate-500">Cập nhật</dt>
            <dd className="truncate text-xs font-medium text-slate-800 sm:text-sm">
              {progress?.updatedAt
                ? new Date(progress.updatedAt).toLocaleString('vi-VN')
                : '—'}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-4">
        <Link
          to={`/learn/${encodeURIComponent(lesson.id)}`}
          state={{ launchPath: lesson.launchPath, title: lesson.title }}
          className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99]"
        >
          Học bài
        </Link>
      </div>
    </article>
  );
}
