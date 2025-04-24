import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import ticketReducer from './slices/ticketSlice';
import agentReducer from './slices/agentSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketReducer,
    agents: agentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store; 