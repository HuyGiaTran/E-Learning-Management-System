import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function LessonViewPage() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch(`/api/lessons/${encodeURIComponent(lessonId)}`);
        if (!cancelled) setLesson(data);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Lỗi');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  if (err) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        {err}{' '}
        <Link to="/student" className="font-semibold underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  if (!lesson) {
    return <p className="text-slate-600">Đang tải bài…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/student" className="text-sm font-semibold text-indigo-600 hover:underline">
        ← Về LMS
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">{lesson.title}</h1>
      <p className="text-sm text-slate-500">Loại: {lesson.type}</p>

      {lesson.type === 'Video' ? (
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
          <video src={lesson.content} controls className="h-full w-full" title={lesson.title} />
        </div>
      ) : (
        <article className="prose prose-slate max-w-none rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{lesson.content}</div>
        </article>
      )}
    </div>
  );
}
