// src/store/slices/chatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:7000/api').replace(/\/$/, '').replace(/\/auth$/, ''); // Base URL

// Async thunks
export const getConversations = createAsyncThunk(
  'chat/getConversations',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token || localStorage.getItem('access_token');

      const response = await axios.get(`${API_URL}/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get conversations error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: 'Failed to get conversations' });
    }
  }
);

export const getMessages = createAsyncThunk(
  'chat/getMessages',
  async (conversationId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token || localStorage.getItem('access_token');

      const response = await axios.get(`${API_URL}/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return { conversationId, messages: response.data };
    } catch (error) {
      console.error('Get messages error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: 'Failed to get messages' });
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, message }, { rejectWithValue, getState, dispatch }) => {
    try {
      const { auth } = getState();
      const token = auth.token || localStorage.getItem('access_token');

      // Create message object
      const messageData = {
        content: message.content || message,
        message_type: message.type || 'text',
        conversation_id: conversationId,
        sender_id: auth.user?._id,
        tempId: message.tempId
      };

      // Optimistically add message to state
      const tempMessage = {
        ...messageData,
        id: message.tempId || `temp_${Date.now()}`,
        created_at: new Date().toISOString(),
        status: 'sending',
        sender: auth.user
      };

      dispatch(addMessage(tempMessage));

      // Send via HTTP
      const response = await axios.post(
        `${API_URL}/messages`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Send message error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: 'Failed to send message' });
    }
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token || localStorage.getItem('access_token');

      const response = await axios.post(
        `${API_URL}/conversations`,
        {
          participant_ids: [userId], // Assuming your backend expects participant_ids
          // or maybe just: { user_id: userId }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Create conversation error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: 'Failed to create conversation' });
    }
  }
);

export const getUsers = createAsyncThunk(
  'chat/getUsers',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token || localStorage.getItem('access_token');

      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get users error:', error.response?.data || error.message);
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
      const newMessage = action.payload;
      const targetId = newMessage.id || newMessage._id;
      const tempId = newMessage.tempId;

      // Check if message already exists by id or tempId
      const existsById = state.messages.some(msg =>
        (msg.id === targetId || msg._id === targetId)
      );

      const existsByTempId = tempId
        ? state.messages.some(msg => msg.tempId === tempId || msg.id === tempId)
        : false;

      if (!existsById && !existsByTempId) {
        state.messages.push({
          ...newMessage,
          id: targetId,
          status: newMessage.status || 'sent'
        });
      } else {
        // If message exists with tempId, replace it with the real message
        if (existsByTempId && targetId && !targetId.toString().startsWith('temp_')) {
          const index = state.messages.findIndex(msg => msg.tempId === tempId || msg.id === tempId);
          if (index !== -1) {
            state.messages[index] = {
              ...state.messages[index],
              ...newMessage,
              id: targetId,
              status: 'sent'
            };
          }
        }
        console.log('Duplicate message prevented or updated:', targetId || tempId);
      }

      // Update last message in conversation list
      const conversation = state.conversations.find(c =>
        (c.id === newMessage.conversation_id || c._id === newMessage.conversation_id)
      );
      if (conversation) {
        conversation.last_message = {
          content: newMessage.content,
          message_type: newMessage.message_type || 'text'
        };
        conversation.last_message_at = newMessage.created_at || newMessage.createdAt || new Date().toISOString();

        // Move this conversation to the top
        state.conversations = [
          conversation,
          ...state.conversations.filter(c => (c.id || c._id) !== (conversation.id || conversation._id))
        ];
      }
    },
    updateMessage: (state, action) => {
      const { tempId, message } = action.payload;
      const realId = message.id || message._id;

      const index = state.messages.findIndex(msg => msg.tempId === tempId || msg.id === tempId);

      if (index !== -1) {
        state.messages[index] = {
          ...state.messages[index],
          ...message,
          id: realId,
          status: 'sent'
        };
      } else {
        // Double check by ID just in case
        const idIndex = state.messages.findIndex(msg => (msg.id === realId || msg._id === realId));
        if (idIndex === -1) {
          state.messages.push({
            ...message,
            id: realId,
            status: 'sent'
          });
        }
      }
    },
    updateConversationLastMessage: (state, action) => {
      const { conversationId, lastMessage } = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId || c._id === conversationId);
      if (conversation) {
        conversation.last_message = lastMessage;
        conversation.last_message_at = new Date().toISOString();
      }
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      const message = state.messages.find(msg => (msg.id === messageId || msg._id === messageId));
      if (message) {
        message.status = status;
      }
    },
    updateUserStatus: (state, action) => {
      const { userId, isOnline } = action.payload;
      const user = state.users.find(u => (u.id === userId || u._id === userId));
      if (user) {
        user.is_online = isOnline;
      }

      // Also update online status in conversations list
      state.conversations.forEach(conv => {
        if (conv.other_user?.id === userId || conv.other_user?._id === userId) {
          conv.other_user.is_online = isOnline;
        }
      });
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
        state.conversations = action.payload.conversations || action.payload || [];
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to load conversations';
      })
      // Get Messages
      .addCase(getMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages?.messages || action.payload.messages || [];
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to load messages';
      })
      // Get Users
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users || action.payload || [];
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to load users';
      })
      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = action.payload.message || action.payload;
        const tempId = action.meta.arg.message.tempId;
        const realId = message._id || message.id;

        const index = state.messages.findIndex(msg => (
          (msg.id === realId || msg._id === realId) ||
          (tempId && (msg.id === tempId || msg.tempId === tempId))
        ));

        if (index !== -1) {
          state.messages[index] = {
            ...state.messages[index],
            ...message,
            id: realId,
            status: 'sent'
          };
        } else {
          state.messages.push({
            ...message,
            id: realId,
            status: 'sent'
          });
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        // Mark temporary message as failed
        const tempMessage = action.meta.arg.message;
        const tempIndex = state.messages.findIndex(msg => msg.id === tempMessage.id);
        if (tempIndex !== -1) {
          state.messages[tempIndex].status = 'failed';
        }
        state.error = action.payload?.error || 'Failed to send message';
      })
      // Create Conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        const conversation = action.payload.conversation || action.payload;
        if (conversation) {
          const { auth } = action.meta.getState?.() || {};
          const currentUserId = auth?.user?.id || auth?.user?._id;

          state.conversations.unshift({
            id: conversation._id || conversation.id,
            other_user: action.payload.other_user ||
              conversation.participants?.find(p => (p._id || p.id) !== currentUserId),
            last_message: null,
            last_message_at: conversation.created_at || conversation.createdAt
          });
        }
      });
  },
});

export const {
  setCurrentConversation,
  clearMessages,
  addMessage,
  updateConversationLastMessage,
  updateMessageStatus,
  updateUserStatus,
  updateMessage
} = chatSlice.actions;

export default chatSlice.reducer;