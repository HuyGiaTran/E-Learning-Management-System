import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch } from '../../lib/api';

export const fetchMyCourses = createAsyncThunk('courses/mine', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/api/courses');
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const fetchDiscover = createAsyncThunk('courses/discover', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/api/courses?discover=true');
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const fetchCourse = createAsyncThunk('courses/one', async (id, { rejectWithValue }) => {
  try {
    return await apiFetch(`/api/courses/${encodeURIComponent(id)}`);
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const createCourse = createAsyncThunk('courses/create', async (body, { rejectWithValue }) => {
  try {
    return await apiFetch('/api/courses', { method: 'POST', body });
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const updateCourse = createAsyncThunk(
  'courses/update',
  async ({ id, ...body }, { rejectWithValue }) => {
    try {
      return await apiFetch(`/api/courses/${encodeURIComponent(id)}`, { method: 'PATCH', body });
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteCourse = createAsyncThunk('courses/delete', async (id, { rejectWithValue }) => {
  try {
    await apiFetch(`/api/courses/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return id;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const enrollCourse = createAsyncThunk('courses/enroll', async (id, { rejectWithValue }) => {
  try {
    await apiFetch(`/api/courses/${encodeURIComponent(id)}/enroll`, { method: 'POST' });
    return id;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const unenrollCourse = createAsyncThunk('courses/unenroll', async (id, { rejectWithValue }) => {
  try {
    await apiFetch(`/api/courses/${encodeURIComponent(id)}/unenroll`, { method: 'POST' });
    return id;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const addStudentEmail = createAsyncThunk(
  'courses/addStudent',
  async ({ courseId, email }, { rejectWithValue }) => {
    try {
      return await apiFetch(`/api/courses/${encodeURIComponent(courseId)}/students`, {
        method: 'POST',
        body: { email },
      });
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const removeStudent = createAsyncThunk(
  'courses/removeStudent',
  async ({ courseId, studentId }, { rejectWithValue }) => {
    try {
      await apiFetch(
        `/api/courses/${encodeURIComponent(courseId)}/students/${encodeURIComponent(studentId)}`,
        { method: 'DELETE' }
      );
      return { courseId, studentId };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const createLesson = createAsyncThunk(
  'courses/createLesson',
  async ({ courseId, ...body }, { rejectWithValue }) => {
    try {
      return await apiFetch(`/api/courses/${encodeURIComponent(courseId)}/lessons`, {
        method: 'POST',
        body,
      });
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteLesson = createAsyncThunk('courses/deleteLesson', async (lessonId, { rejectWithValue }) => {
  try {
    await apiFetch(`/api/lessons/${encodeURIComponent(lessonId)}`, { method: 'DELETE' });
    return lessonId;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const initialState = {
  myList: [],
  discoverList: [],
  current: null,
  status: 'idle',
  error: null,
};

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyCourses.fulfilled, (s, a) => {
        s.myList = a.payload;
      })
      .addCase(fetchDiscover.fulfilled, (s, a) => {
        s.discoverList = a.payload;
      })
      .addCase(fetchCourse.fulfilled, (s, a) => {
        s.current = a.payload;
      })
      .addCase(createCourse.fulfilled, (s, a) => {
        s.myList.unshift(a.payload);
      })
      .addCase(deleteCourse.fulfilled, (s, a) => {
        s.myList = s.myList.filter((c) => c._id !== a.payload && c.id !== a.payload);
        s.discoverList = s.discoverList.filter((c) => c._id !== a.payload && c.id !== a.payload);
        if (s.current && String(s.current._id || s.current.id) === String(a.payload)) {
          s.current = null;
        }
      })
      .addCase(updateCourse.fulfilled, (s, a) => {
        const c = a.payload;
        const id = String(c._id || c.id);
        s.myList = s.myList.map((x) => (String(x._id || x.id) === id ? c : x));
        if (s.current && String(s.current._id || s.current.id) === id) s.current = c;
      })
      .addCase(enrollCourse.fulfilled, (s, a) => {
        const id = a.payload;
        s.discoverList = s.discoverList.map((c) =>
          String(c._id || c.id) === String(id) ? { ...c, isEnrolled: true } : c
        );
      })
      .addCase(unenrollCourse.fulfilled, (s, a) => {
        const id = a.payload;
        s.discoverList = s.discoverList.map((c) =>
          String(c._id || c.id) === String(id) ? { ...c, isEnrolled: false } : c
        );
        s.myList = s.myList.filter((c) => String(c._id || c.id) !== String(id));
      })
      .addCase(createLesson.fulfilled, (s, a) => {
        const lesson = a.payload;
        if (!s.current || !lesson.course) return;
        const cid = String(s.current._id || s.current.id);
        if (String(lesson.course) !== cid) return;
        const lessons = [...(s.current.lessons || [])];
        lessons.push(lesson);
        s.current = { ...s.current, lessons };
      })
      .addCase(deleteLesson.fulfilled, (s, a) => {
        const lid = a.payload;
        if (!s.current?.lessons) return;
        s.current = {
          ...s.current,
          lessons: s.current.lessons.filter((l) => String(l._id || l.id) !== String(lid)),
        };
      })
      .addCase(removeStudent.fulfilled, (s, a) => {
        const { courseId, studentId } = a.payload;
        if (!s.current || String(s.current._id || s.current.id) !== String(courseId)) return;
        s.current = {
          ...s.current,
          students: (s.current.students || []).filter((u) => String(u._id || u.id) !== String(studentId)),
        };
      })
      .addCase(addStudentEmail.fulfilled, (s, a) => {
        const st = a.payload?.student;
        if (!s.current || !st) return;
        const students = [...(s.current.students || [])];
        students.push({ _id: st.id, id: st.id, fullName: st.fullName, email: st.email });
        s.current = { ...s.current, students };
      });
  },
});

export const { clearCurrent } = coursesSlice.actions;
export default coursesSlice.reducer;
