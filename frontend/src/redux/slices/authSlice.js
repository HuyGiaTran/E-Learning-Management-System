import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiFetch } from '../../lib/api';
import { getStoredToken, setStoredToken } from '../../hooks/useAuthToken';

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    return await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const register = createAsyncThunk(
  'auth/register',
  async ({ fullName, email, password }, { rejectWithValue }) => {
    try {
      return await apiFetch('/api/auth/register', { method: 'POST', body: { fullName, email, password } });
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/api/auth/me');
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const initialState = {
  user: null,
  token: getStoredToken(),
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      setStoredToken(null);
    },
    hydrateToken(state) {
      state.token = getStoredToken();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.token = a.payload.token;
        s.user = a.payload.user;
        setStoredToken(a.payload.token);
      })
      .addCase(login.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload || a.error.message;
      })
      .addCase(register.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.token = a.payload.token;
        s.user = a.payload.user;
        setStoredToken(a.payload.token);
      })
      .addCase(register.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload || a.error.message;
      })
      .addCase(fetchMe.pending, (s) => {
        s.status = 'loading';
      })
      .addCase(fetchMe.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.user = a.payload.user;
      })
      .addCase(fetchMe.rejected, (s) => {
        s.status = 'idle';
        s.user = null;
        s.token = null;
        setStoredToken(null);
      });
  },
});

export const { logout, hydrateToken } = authSlice.actions;
export default authSlice.reducer;
