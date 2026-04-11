import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { upsertLesson } from '../redux/slices/studentDashboardSlice';

export const LMS_STUDENT_LESSONS_KEY = 'lms_student_lessons';

/** Đọc danh sách bài tạm từ sessionStorage (form trên Dashboard) */
export function useHydrateStudentLessons() {
  const dispatch = useAppDispatch();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    try {
      const raw = sessionStorage.getItem(LMS_STUDENT_LESSONS_KEY);
      if (!raw) return;
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return;
      list.forEach((l) => {
        if (l?.id && l?.launchPath) {
          dispatch(
            upsertLesson({
              id: String(l.id),
              title: l.title || 'Bài SCORM',
              type: 'SCORM',
              launchPath: String(l.launchPath),
              isDemo: false,
            })
          );
        }
      });
    } catch {
      /* ignore */
    }
  }, [dispatch]);
}

export function saveLessonsToSession(lessons) {
  sessionStorage.setItem(LMS_STUDENT_LESSONS_KEY, JSON.stringify(lessons));
}
