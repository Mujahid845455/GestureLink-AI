
// src/services/socketService.js
import { io } from "socket.io-client";
import { store } from '../store/store';
import { addMessage, updateMessageStatus } from '../store/slices/chatSlice';

class SocketService {
  constructor() {
    this.mainSocket = null;
    this.aiSocket = null;
    this.token = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (!token) return;
    this.token = token;

    // URLs from environment variables
    const MAIN_BACKEND_URL = import.meta.env.VITE_SOCKET_URL || "https://gesturelink-ai-backend.onrender.com";
    const AI_BACKEND_URL = import.meta.env.VITE_AI_SOCKET_URL || "https://capture-and-send-backend.onrender.com";

    // 1. Connect to Main Backend (Chat, Auth)
    if (!this.mainSocket?.connected) {
      console.log(`🔌 Connecting to Main Backend: ${MAIN_BACKEND_URL}`);
      this.mainSocket = io(MAIN_BACKEND_URL, {
        transports: ["websocket"],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });
      this.setupMainListeners();
    }

    // 2. Connect to AI Backend (Prediction)
    if (!this.aiSocket?.connected) {
      console.log(`🧠 Connecting to AI Prediction Backend: ${AI_BACKEND_URL}`);
      this.aiSocket = io(AI_BACKEND_URL, {
        transports: ["websocket"],
        // auth: { token }, // AI backend might not need auth token or uses a different one
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });
      this.setupAIListeners();
    }
  }

  setupMainListeners() {
    if (!this.mainSocket) return;

    this.mainSocket.on("connect", () => {
      console.log("✅ Main Backend connected:", this.mainSocket.id);
      this.emitEvent('connect', this.mainSocket.id);
    });

    this.mainSocket.on("disconnect", (reason) => {
      console.log("❌ Main Backend disconnected:", reason);
      this.emitEvent('disconnect', reason);
    });

    this.mainSocket.on("connect_error", (err) => {
      console.error("🔌 Main Backend error:", err.message);
      this.emitEvent('connect_error', err);
    });

    this.mainSocket.on("new_message", (message) => {
      console.log("📨 New message from Main:", message);
      const state = store.getState();
      const existingTempMessage = state.chat.messages.find(
        msg => (msg.status === 'sending' || msg.id?.toString().startsWith('temp_')) &&
          (msg.tempId === message.tempId || (msg.content === message.content && msg.sender_id === message.sender_id))
      );

      if (existingTempMessage) {
        store.dispatch({
          type: 'chat/updateMessage',
          payload: { tempId: existingTempMessage.tempId || existingTempMessage.id, message }
        });
      } else {
        store.dispatch(addMessage(message));
      }
      this.emitEvent('new_message', message);
    });

    this.mainSocket.on("message_status", (data) => {
      if (data.messageId && data.status) {
        store.dispatch(updateMessageStatus({ messageId: data.messageId, status: data.status }));
      }
      this.emitEvent('message_status', data);
    });

    this.mainSocket.on("user_typing", (data) => this.emitEvent('typing', data));
    this.mainSocket.on("user_online", (userId) => this.emitEvent('user_online', userId));
    this.mainSocket.on("user_offline", (userId) => this.emitEvent('user_offline', userId));
  }

  setupAIListeners() {
    if (!this.aiSocket) return;

    this.aiSocket.on("connect", () => {
      console.log("✅ AI Backend connected:", this.aiSocket.id);
    });

    this.aiSocket.on("disconnect", (reason) => {
      console.log("❌ AI Backend disconnected:", reason);
    });

    this.aiSocket.on("connect_error", (err) => {
      console.error("🔌 AI Backend error:", err.message);
    });

    // Capture landmarks from AI Backend
    this.aiSocket.on("landmarks_processed", (data) => {
      // console.log("📡 Landmarks from AI Server");
      this.emitEvent('landmarks', data);
    });

    this.aiSocket.on("sign", (data) => {
      console.log("🖖 Sign from AI Server:", data);
      this.emitEvent('sign', data);
    });
  }

  // Event Subscription Logic
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  emitEvent(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try { callback(data); } catch (err) { console.error(`Error in ${event} callback:`, err); }
      });
    }
  }

  // Wrapper Methods for Components
  onConnect(cb) { return this.on('connect', cb); }
  onNewMessage(cb) { return this.on('new_message', cb); }
  onTyping(cb) { return this.on('typing', cb); }
  onUserOnline(cb) { return this.on('user_online', cb); }
  onUserOffline(cb) { return this.on('user_offline', cb); }
  onLandmarks(cb) { return this.on('landmarks', cb); }
  onSign(cb) { return this.on('sign', cb); }

  // Socket Actions
  sendMessage(data) { this.mainSocket?.emit("send_message", data); }
  joinConversation(id) { this.mainSocket?.emit("join_conversation", id); }
  leaveConversation(id) { this.mainSocket?.emit("leave_conversation", id); }
  sendTyping(id, isTyping) { this.mainSocket?.emit("typing", { conversationId: id, isTyping }); }
  markAsRead(msgId, convId) { this.mainSocket?.emit("mark_read", { messageId: msgId, conversationId: convId }); }

  // AI Specific Actions
  startTracking() {
    console.log("📤 Sending start_tracking to AI Server");
    this.aiSocket?.emit("start_tracking");
  }

  stopTracking() {
    console.log("📤 Sending stop_tracking to AI Server");
    this.aiSocket?.emit("stop_tracking");
  }

  isConnected() {
    return this.mainSocket?.connected || false;
  }

  disconnect() {
    this.mainSocket?.disconnect();
    this.aiSocket?.disconnect();
    this.mainSocket = null;
    this.aiSocket = null;
    this.listeners.clear();
    console.log("All sockets disconnected");
  }
}

export default new SocketService();
