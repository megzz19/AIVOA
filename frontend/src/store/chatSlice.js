import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [
    { role: 'ai', content: 'Ask me anything about this complaint...' }
  ],
  isLoading: false,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    resetChat: () => initialState,
  },
});

export const { addMessage, setLoading, resetChat } = chatSlice.actions;

export default chatSlice.reducer;
