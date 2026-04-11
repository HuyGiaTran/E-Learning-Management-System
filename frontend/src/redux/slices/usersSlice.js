import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch } from '../../lib/api';

export const fetchUsers = createAsyncThunk('users/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/api/users');
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const createUser = createAsyncThunk('users/create', async (body, { rejectWithValue }) => {
  try {
    return await apiFetch('/api/users', { method: 'POST', body });
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, ...body }, { rejectWithValue }) => {
    try {
      return await apiFetch(`/api/users/${encodeURIComponent(id)}`, { method: 'PATCH', body });
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteUser = createAsyncThunk('users/delete', async (id, { rejectWithValue }) => {
  try {
    await apiFetch(`/api/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return id;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const initialState = {
  list: [],
  status: 'idle',
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (s) => {
        s.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.list = a.payload;
      })
      .addCase(fetchUsers.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload || a.error.message;
      })
      .addCase(createUser.fulfilled, (s, a) => {
        const u = a.payload.user || a.payload;
        if (u) s.list.unshift(u);
      })
      .addCase(updateUser.fulfilled, (s, a) => {
        const u = a.payload.user;
        const i = s.list.findIndex((x) => x.id === u.id);
        if (i >= 0) s.list[i] = u;
      })
      .addCase(deleteUser.fulfilled, (s, a) => {
        s.list = s.list.filter((x) => x.id !== a.payload);
      });
  },
});

export default usersSlice.reducer;
