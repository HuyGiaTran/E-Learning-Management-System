import { useMemo } from 'react';

const STATUS_WEIGHT = {
  'not attempted': 0,
  browsed: 5,
  incomplete: 35,
  completed: 100,
  passed: 100,
  failed: 100,
};

function clamp(n, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

/** Ước lượng % thanh tiến độ từ lesson_status + điểm raw (0–100) */
export function useLessonProgressPercent(lessonStatus, scoreRaw) {
  return useMemo(() => {
    const s = String(lessonStatus || '')
      .trim()
      .toLowerCase();
    let base = STATUS_WEIGHT[s];
    if (base === undefined) base = s ? 20 : 0;

    const rawNum = Number(scoreRaw);
    if (Number.isFinite(rawNum) && rawNum >= 0) {
      const blended = base * 0.55 + clamp(rawNum) * 0.45;
      return Math.round(clamp(blended));
    }
    return Math.round(clamp(base));
  }, [lessonStatus, scoreRaw]);
}
