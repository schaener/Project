import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '../features/auth/authSlice.js';
import uiReducer from '../features/ui/uiSlice.js';
import { api } from '../services/api.js';
import { setupCachePersistence } from './cachePersistence.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

// Enables refetchOnFocus / refetchOnReconnect
setupListeners(store.dispatch);
setupCachePersistence(store);

// Handy for debugging in the browser console during development
if (import.meta.env.DEV) window.__store = store;
