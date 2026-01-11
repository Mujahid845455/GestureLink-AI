import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Async thunks
export const getConversations = createAsyncThunk(
  'chat/getConversations',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      const response = await axios.get(`${API_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to get conversations' });
    }
  }
);

export const getMessages = createAsyncThunk(
  'chat/getMessages',
  async (conversationId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      const response = await axios.get(`${API_URL}/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { conversationId, messages: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to get messages' });
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, message }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      const response = await axios.post(
        `${API_URL}/messages/${conversationId}`,
        message,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to send message' });
    }
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      const response = await axios.post(
        `${API_URL}/conversations`,
        { user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to create conversation' });
    }
  }
);

export const getUsers = createAsyncThunk(
  'chat/getUsers',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to get users' });
    }
  }
);

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  users: [],
  isLoading: false,
  error: null,
};


// const initialState = {
//   conversations: [
//     {
//       id: 1,
//       other_user: { username: "Test User" },
//       last_message: "Hello",
//       last_message_at: new Date().toISOString()
//     }
//   ],
//   currentConversation: null,
//   messages: [],
//   users: [],
//   isLoading: false,
//   error: null,
// };


const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateConversationLastMessage: (state, action) => {
      const { conversationId, lastMessage } = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.last_message = lastMessage;
        conversation.last_message_at = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Conversations
      .addCase(getConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload.conversations;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error;
      })
      // Get Messages
      .addCase(getMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages.messages.reverse();
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error;
      })
      // Get Users
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error;
      })
      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload.message_data);
      })
      // Create Conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        if (action.payload.conversation) {
          state.conversations.unshift({
            id: action.payload.conversation.id,
            other_user: action.payload.other_user,
            last_message: null,
            last_message_at: action.payload.conversation.created_at
          });
        }
      });
  },
});

export const { 
  setCurrentConversation,
  startNewConversation, 
  clearMessages, 
  addMessage,
  updateConversationLastMessage 
} = chatSlice.actions;
export default chatSlice.reducer;