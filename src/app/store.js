import { configureStore } from '@reduxjs/toolkit';
import quintoSlices from 'slices/quintoSlices';

export const store = configureStore({
  reducer: {
    quintoSlices: quintoSlices,
  },
});

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
