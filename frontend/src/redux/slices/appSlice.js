import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  title: 'E-Learning LMS',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {},
});

export default appSlice.reducer;
