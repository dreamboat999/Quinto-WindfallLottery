import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: 3,
};

export const QuintoSlice = createSlice({
  name: 'quintoSlice',
  initialState,
  reducers: {
    setConnectedStatus: (state, action) => {
      state.connected = action.payload;
    },
  },
});

export const { setConnectedStatus } = QuintoSlice.actions;
export default QuintoSlice.reducer;
