// src/services/socketService.js
import { io } from "socket.io-client";
import { store } from '../store/store';
import { addMessage, updateMessageStatus } from '../store/slices/chatSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.token = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (!token) return;
    this.token = token;

    if (this.socket?.connected) {
      return;
    }

    this.socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:7000", {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupListeners();
  }

  setupListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket.id);
      this.emitEvent('connect', this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      this.emitEvent('disconnect', reason);
    });

    this.socket.on("connect_error", (err) => {
      console.error("🔌 Socket connection error:", err.message);
      this.emitEvent('connect_error', err);
    });

    // Listen for new messages
    this.socket.on("new_message", (message) => {
      console.log("📨 New message received:", message);

      const state = store.getState();
      const existingTempMessage = state.chat.messages.find(
        msg => (msg.status === 'sending' || msg.id?.toString().startsWith('temp_')) &&
          (msg.tempId === message.tempId || (msg.content === message.content && msg.sender_id === message.sender_id))
      );

      if (existingTempMessage) {
        store.dispatch({
          type: 'chat/updateMessage',
          payload: {
            tempId: existingTempMessage.tempId || existingTempMessage.id,
            message: message
          }
        });
      } else {
        store.dispatch(addMessage(message));
      }

      this.emitEvent('new_message', message);
    });

    // Listen for message status updates
    this.socket.on("message_status", (data) => {
      console.log("📊 Message status:", data);
      if (data.messageId && data.status) {
        store.dispatch(updateMessageStatus({
          messageId: data.messageId,
          status: data.status
        }));
      }
      this.emitEvent('message_status', data);
    });

    // Listen for typing indicators
    this.socket.on("user_typing", (data) => {
      console.log("⌨️ User typing:", data);
      this.emitEvent('typing', data);
    });

    // Listen for user online status
    this.socket.on("user_online", (userId) => {
      console.log("🟢 User online:", userId);
      this.emitEvent('user_online', userId);
    });

    this.socket.on("user_offline", (userId) => {
      console.log("🔴 User offline:", userId);
      this.emitEvent('user_offline', userId);
    });

    // Listen for landmarks (Real-time AI data)
    this.socket.on("landmarks", (data) => {
      // console.log("📡 Landmarks received"); // Too noisy for production
      this.emitEvent('landmarks', data);
    });

    // Listen for sign detection
    this.socket.on("sign", (data) => {
      console.log("🖖 Sign detected:", data);
      this.emitEvent('sign', data);
    });
  }

  // Specific event subscriptors used by components
  onConnect(callback) {
    return this.on('connect', callback);
  }

  onNewMessage(callback) {
    return this.on('new_message', callback);
  }

  onTyping(callback) {
    return this.on('typing', callback);
  }

  onUserOnline(callback) {
    return this.on('user_online', callback);
  }

  onUserOffline(callback) {
    return this.on('user_offline', callback);
  }

  onLandmarks(callback) {
    return this.on('landmarks', callback);
  }

  onSign(callback) {
    return this.on('sign', callback);
  }

  // Event emitter helper
  emitEvent(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in ${event} callback:`, err);
        }
      });
    }
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  // Unsubscribe from events
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Join a conversation room
  joinConversation(conversationId) {
    if (this.socket?.connected) {
      console.log(`Joining conversation: ${conversationId}`);
      this.socket.emit("join_conversation", conversationId);
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId) {
    if (this.socket?.connected) {
      console.log(`Leaving conversation: ${conversationId}`);
      this.socket.emit("leave_conversation", conversationId);
    }
  }

  // Send a message
  sendMessage(messageData) {
    if (this.socket?.connected) {
      this.socket.emit("send_message", messageData);
    }
  }

  // Send typing indicator
  sendTyping(conversationId, isTyping) {
    if (this.socket?.connected) {
      this.socket.emit("typing", {
        conversationId,
        isTyping
      });
    }
  }

  // Mark message as read
  markAsRead(messageId, conversationId) {
    if (this.socket?.connected) {
      this.socket.emit("mark_read", { messageId, conversationId });
    }
  }

  startTracking() {
    if (this.socket?.connected) {
      console.log("📤 Sending start_tracking signal");
      this.socket.emit("start_tracking");
    }
  }

  stopTracking() {
    if (this.socket?.connected) {
      console.log("📤 Sending stop_tracking signal");
      this.socket.emit("stop_tracking");
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log("Socket disconnected");
    }
  }
}

export default new SocketService();
