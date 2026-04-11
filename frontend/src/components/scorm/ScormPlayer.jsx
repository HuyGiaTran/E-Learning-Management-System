import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { setProgressLocal } from '../../redux/slices/studentDashboardSlice';
import { attachScorm12RuntimeBridge } from '../../lib/scormRuntimeBridge';
import { getStoredToken } from '../../hooks/useAuthToken';

/**
 * Hiển thị gói SCORM qua iframe + cầu nối SCORM 1.2 (`window.API`) trong `src/lib/scormRuntimeBridge.js`.
 * Cần proxy Vite `/scorm-content` → backend để iframe cùng origin với LMS (SCO tìm API ở parent).
 */
export default function ScormPlayer({ lessonId, launchPath, title }) {
  const dispatch = useAppDispatch();
  const [phase, setPhase] = useState('init');
  const [iframeSrc, setIframeSrc] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!lessonId || !launchPath) {
      setPhase('error');
      setError('Thiếu lessonId hoặc đường dẫn gói SCORM.');
      return;
    }

    let bridge;
    let cancelled = false;

    (async () => {
      setPhase('loading');
      setError('');

      const headers = {};
      const token = getStoredToken();
      if (token) headers.Authorization = `Bearer ${token}`;

      let initialCmi = {};
      try {
        const res = await fetch(`/api/scorm/cmi/${encodeURIComponent(lessonId)}`, {
          headers,
        });
        if (res.ok) {
          const data = await res.json();
          initialCmi = data.cmi || {};
        }
      } catch {
        /* offline — vẫn mở player */
      }

      if (cancelled) return;

      bridge = attachScorm12RuntimeBridge({
        lessonId,
        getToken: getStoredToken,
        initialCmi,
        onOutbound: ({ cmi }) => {
          dispatch(
            setProgressLocal({
              lessonId,
              lessonStatus: cmi['cmi.core.lesson_status'],
              scoreRaw: cmi['cmi.core.score.raw'],
            })
          );
        },
      });

      setIframeSrc(launchPath);
      setPhase('ready');
    })();

    return () => {
      cancelled = true;
      bridge?.detach();
      setIframeSrc(null);
    };
  }, [lessonId, launchPath, dispatch]);

  return (
    <section className="flex flex-col gap-4" aria-labelledby="scorm-player-title">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="scorm-player-title"
            className="text-lg font-semibold text-slate-900 sm:text-xl"
          >
            {title || 'Bài SCORM'}
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Cầu nối runtime: <code className="rounded bg-slate-100 px-1">window.API</code> (SCORM
            1.2) → POST <code className="rounded bg-slate-100 px-1">/api/scorm/cmi</code>
          </p>
        </div>
        {phase === 'loading' ? (
          <p className="text-sm text-indigo-600">Đang tải tiến độ &amp; khởi tạo API…</p>
        ) : null}
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {error}
        </div>
      ) : null}

      <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/5 shadow-inner ring-1 ring-slate-900/5">
        <div className="aspect-video w-full min-h-[220px] sm:min-h-[360px] lg:min-h-[480px]">
          {iframeSrc && phase === 'ready' ? (
            <iframe
              title={title || 'SCORM'}
              src={iframeSrc}
              className="h-full w-full bg-white"
              allow="fullscreen; autoplay; microphone; camera; display-capture"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-slate-600">
              {phase === 'loading' ? 'Chuẩn bị bài giảng…' : 'Chưa có nội dung iframe.'}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
