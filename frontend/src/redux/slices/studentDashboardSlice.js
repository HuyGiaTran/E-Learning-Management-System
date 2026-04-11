import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const TOKEN_KEY = 'lms_token';

function authHeaders() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function lessonsFromEnv() {
  const id = import.meta.env.VITE_SCORM_LESSON_ID;
  const launch = import.meta.env.VITE_SCORM_LAUNCH_PATH;
  if (id && launch) {
    return [
      {
        id: String(id),
        title: import.meta.env.VITE_SCORM_LESSON_TITLE || 'Bài SCORM',
        type: 'SCORM',
        launchPath: String(launch),
        isDemo: false,
      },
    ];
  }
  return [];
}

/** Tải CMI đã lưu cho một bài SCORM */
export const fetchLessonProgress = createAsyncThunk(
  'studentDashboard/fetchLessonProgress',
  async (lessonId, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/scorm/cmi/${encodeURIComponent(lessonId)}`, {
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return rejectWithValue(data.message || `Lỗi ${res.status}`);
      }
      return { lessonId, cmi: data.cmi || {} };
    } catch (e) {
      return rejectWithValue(e.message || 'Lỗi mạng');
    }
  }
);

/** Làm mới toàn bộ danh sách bài (song song) */
export const refreshAllLessonProgress = createAsyncThunk(
  'studentDashboard/refreshAll',
  async (_, { getState, dispatch }) => {
    const { lessons } = getState().studentDashboard;
    await Promise.all(
      lessons.map((l) => dispatch(fetchLessonProgress(l.id)).unwrap().catch(() => null))
    );
  }
);

const initialState = {
  lessons: lessonsFromEnv(),
  progressByLessonId: {},
  listStatus: 'idle',
};

const studentDashboardSlice = createSlice({
  name: 'studentDashboard',
  initialState,
  reducers: {
    upsertLesson(state, action) {
      const lesson = action.payload;
      const idx = state.lessons.findIndex((l) => l.id === lesson.id);
      if (idx >= 0) state.lessons[idx] = { ...state.lessons[idx], ...lesson };
      else state.lessons.push(lesson);
    },
    setProgressLocal(state, action) {
      const { lessonId, lessonStatus, scoreRaw } = action.payload;
      state.progressByLessonId[lessonId] = {
        ...state.progressByLessonId[lessonId],
        lessonStatus: lessonStatus ?? '',
        scoreRaw: scoreRaw ?? '',
        updatedAt: new Date().toISOString(),
        error: undefined,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessonProgress.pending, (state, action) => {
        const id = action.meta.arg;
        state.progressByLessonId[id] = {
          ...state.progressByLessonId[id],
          loading: true,
          error: undefined,
        };
      })
      .addCase(fetchLessonProgress.fulfilled, (state, action) => {
        const { lessonId, cmi } = action.payload;
        state.progressByLessonId[lessonId] = {
          lessonStatus: cmi['cmi.core.lesson_status'] ?? '',
          scoreRaw: cmi['cmi.core.score.raw'] ?? '',
          loading: false,
          error: undefined,
          updatedAt: new Date().toISOString(),
        };
      })
      .addCase(fetchLessonProgress.rejected, (state, action) => {
        const id = action.meta.arg;
        state.progressByLessonId[id] = {
          ...state.progressByLessonId[id],
          loading: false,
          error: String(action.payload || action.error.message || 'Lỗi'),
        };
      })
      .addCase(refreshAllLessonProgress.pending, (state) => {
        state.listStatus = 'loading';
      })
      .addCase(refreshAllLessonProgress.fulfilled, (state) => {
        state.listStatus = 'succeeded';
      })
      .addCase(refreshAllLessonProgress.rejected, (state) => {
        state.listStatus = 'failed';
      });
  },
});

export const { upsertLesson, setProgressLocal } = studentDashboardSlice.actions;
export default studentDashboardSlice.reducer;
