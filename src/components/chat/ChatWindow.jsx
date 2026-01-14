// src/components/chat/ChatWindow.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPaperPlane, FaCamera, FaVideo, FaPhone, FaEllipsisV, FaSmile, FaImage, FaFile, FaMicrophone, FaSignLanguage, FaArrowLeft, FaPaperclip } from 'react-icons/fa';
import { sendMessage, getMessages } from '../../store/slices/chatSlice';
import MessageBubble from './MessageBubble';
import CameraFeed from '../camera/CameraFeed';
import EmojiPicker from './EmojiPicker';
import CameraCapture from './CameraCapture';
import socketService from '../../services/socketService';
import axios from 'axios';

const ChatWindow = ({ conversation, currentUser, onBack, isMobile }) => {
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state) => state.chat);
  const { cameraEnabled } = useSelector((state) => state.ui);

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showASLPicker, setShowASLPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // ASL Alphabet images array
  const aslAlphabet = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'space', 'nothing'
  ];

  // Load messages for this conversation
  useEffect(() => {
    if (conversation?.id) {
      dispatch(getMessages(conversation.id));
    }
  }, [dispatch, conversation]);

  // Scroll to bottom when messages change and mark as read
  useEffect(() => {
    scrollToBottom();

    // Mark last unread message from other user as read
    const currentUserId = currentUser?._id || currentUser?.id;
    const unreadMessages = messages.filter(m => m.sender_id !== currentUserId && m.status !== 'read');
    if (unreadMessages.length > 0 && conversation?.id) {
      unreadMessages.forEach(msg => {
        socketService.markAsRead(msg.id || msg._id, conversation.id);
      });
    }
  }, [messages, conversation?.id, currentUser?.id]);

  // Listen for typing indicators from other user
  useEffect(() => {
    if (!conversation?.id) return;

    const handleTypingIndicator = (data) => {
      if (data.conversationId === conversation.id && data.userId !== currentUser?.id) {
        setOtherUserTyping(data.isTyping);

        // Clear typing indicator after 3 seconds
        if (data.isTyping) {
          setTimeout(() => {
            setOtherUserTyping(false);
          }, 3000);
        }
      }
    };

    // Listen for typing events
    const unsubscribe = socketService.onTyping(handleTypingIndicator);

    return () => {
      unsubscribe();
    };
  }, [conversation?.id, currentUser?.id]);

  // Client-side deduplication as a safety net
  const uniqueMessages = useMemo(() => {
    const seen = new Set();
    return messages.filter(msg => {
      const key = msg.id || msg._id || msg.tempId;
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !conversation?.id) return;

    const messageData = {
      type: 'text',
      content: message.trim(),
      sender_id: currentUser?._id || currentUser?.id,
      conversation_id: conversation.id,
      created_at: new Date().toISOString(),
      tempId: `temp_${Date.now()}`
    };

    try {
      // Send message via Redux thunk (which also sends via socket)
      await dispatch(sendMessage({
        conversationId: conversation.id,
        message: messageData
      }));

      setMessage('');
      setIsTyping(false);

      // Clear typing indicator
      socketService.sendTyping(conversation.id, false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!conversation?.id) return;

    // Send typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      socketService.sendTyping(conversation.id, true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      socketService.sendTyping(conversation.id, false);
    }
  };

  // Handle key press for Enter to send
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Handle ASL image selection and send
  const handleASLImageSelect = (letter) => {
    const tempId = `temp_${Date.now()}`;

    const messageData = {
      content: letter,
      type: 'asl_image',
      imagePath: `/asl_alphabet_test/${letter}_test.jpg`,
      tempId: tempId
    };

    // Send via Redux (which handles both HTTP and socket)
    dispatch(sendMessage({
      conversationId: conversation?.id,
      message: messageData
    }));

    // Close modal
    setShowASLPicker(false);
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:7000/api').replace(/\/$/, '').replace(/\/auth$/, '');
      const response = await axios.post(`${API_URL}/upload/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Send message with file
      const messageData = {
        content: file.name,
        type: 'file',
        mediaUrl: response.data.fileUrl,
        fileName: response.data.fileName,
        fileSize: response.data.fileSize,
        mimeType: response.data.mimeType
      };

      dispatch(sendMessage({
        conversationId: conversation?.id,
        message: messageData
      }));

    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const image = e.target.files[0];
    if (!image) return;

    // Check if it's an image
    if (!image.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (5MB max)
    if (image.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);

      const token = localStorage.getItem('token');
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:7000/api').replace(/\/$/, '').replace(/\/auth$/, '');
      const response = await axios.post(`${API_URL}/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Send message with image
      const messageData = {
        content: 'Image',
        type: 'image',
        mediaUrl: response.data.imageUrl,
        fileName: response.data.fileName,
        fileSize: response.data.fileSize,
        mimeType: response.data.mimeType
      };

      dispatch(sendMessage({
        conversationId: conversation?.id,
        message: messageData
      }));

    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  // Handle camera capture
  const handleCameraCapture = async (imageData) => {
    setUploading(true);
    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'camera-capture.jpg');

      const token = localStorage.getItem('token');
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:7000/api').replace(/\/$/, '').replace(/\/auth$/, '');
      const uploadResponse = await axios.post(`${API_URL}/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Send message with captured photo
      const messageData = {
        content: 'Camera Photo',
        type: 'camera',
        mediaUrl: uploadResponse.data.imageUrl,
        fileName: uploadResponse.data.fileName,
        fileSize: uploadResponse.data.fileSize,
        mimeType: uploadResponse.data.mimeType
      };

      dispatch(sendMessage({
        conversationId: conversation?.id,
        message: messageData
      }));

    } catch (error) {
      console.error('Camera capture error:', error);
      alert('Failed to send photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-3 md:py-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {(onBack || isMobile) && (
              <button
                onClick={() => {
                  console.log('Back button clicked in ChatWindow');
                  if (onBack) {
                    onBack(); // This calls handleBackToDashboard
                  } else {
                    // Fallback
                    if (window.history.length > 1) {
                      window.history.back();
                    } else {
                      // If no back history, we might need a direct state update
                      // but since we are in a component, onBack is expected.
                    }
                  }
                }}
                className="mr-2 p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all duration-200 group flex items-center"
                title="Back to dashboard"
              >
                <FaArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                {isMobile && <span className="ml-2 text-sm font-medium">Back</span>}
              </button>
            )}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">
                  {conversation.other_user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              {conversation.other_user?.is_online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm animate-pulse"></div>
              )}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {conversation.other_user?.username || 'Unknown User'}
              </h2>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] md:text-xs font-medium px-1.5 py-0.5 rounded ${conversation.other_user?.is_deaf ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                  {conversation.other_user?.is_deaf ? 'Deaf' : 'Hearing'}
                </span>
                {otherUserTyping && (
                  <span className="text-xs text-blue-500 dark:text-blue-400 animate-pulse font-medium">typing...</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 md:space-x-2">
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors hidden sm:block">
              <FaPhone />
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors hidden sm:block">
              <FaVideo />
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <FaEllipsisV />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900/50 scrollbar-thin">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
              <span className="text-4xl text-blue-600">👋</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Start the conversation!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              {currentUser?.is_deaf
                ? 'Use the camera below to sign your first message to ' + (conversation.other_user?.username || 'them')
                : 'Type your first message to ' + (conversation.other_user?.username || 'them') + ' below'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {uniqueMessages.map((msg, index) => {
              const messageKey = msg.id || msg._id || msg.tempId || `msg-${index}-${msg.created_at}`;
              return (
                <MessageBubble
                  key={messageKey}
                  message={msg}
                  isOwn={msg.sender_id === (currentUser?._id || currentUser?.id)}
                  user={msg.sender_id === (currentUser?._id || currentUser?.id) ? currentUser : conversation.other_user}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Camera Feed (for deaf users) */}
      {cameraEnabled && currentUser?.is_deaf && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-black/5 p-2 transition-all">
          <CameraFeed />
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 md:p-4">
        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="*/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            {/* Image button */}
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              title="Upload Image"
            >
              <FaImage />
            </button>

            {/* File button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              title="Upload File"
            >
              <FaFile />
            </button>

            {/* Emoji button */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Emoji"
              >
                <FaSmile />
              </button>
              {showEmojiPicker && (
                <EmojiPicker
                  onEmojiSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </div>

            {currentUser?.is_deaf && (
              <button
                onClick={() => setShowASLPicker(true)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Sign Language"
              >
                <FaSignLanguage />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-1 md:space-x-2">
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Voice Message">
              <FaMicrophone />
            </button>
            <button
              onClick={() => setShowCamera(true)}
              disabled={uploading}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              title="Capture Photo"
            >
              <FaCamera />
            </button>
          </div>
        </div>

        {/* Message Form */}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 md:space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder={
                currentUser?.is_deaf
                  ? "Type message or use camera to sign..."
                  : "Type your message here..."
              }
              className="w-full px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500/50 text-sm md:text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2.5 md:p-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center min-w-[44px] md:min-w-[48px]"
          >
            <FaPaperPlane className="text-lg" />
          </button>
        </form>

        {/* Helper Text */}
        <div className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 text-center">
          {currentUser?.is_deaf ? (
            <p>Press the camera icon to enable sign language detection</p>
          ) : (
            <p>Your messages will be converted to sign language for deaf users</p>
          )}
        </div>
      </div>

      {/* ASL Alphabet Picker Modal */}
      {showASLPicker && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowASLPicker(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  ASL Alphabet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Select a sign to send
                </p>
              </div>
              <button
                onClick={() => setShowASLPicker(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Image Grid */}
            <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                {aslAlphabet.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleASLImageSelect(letter)}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 hover:ring-4 hover:ring-blue-500/50 transition-all duration-200 hover:scale-105"
                  >
                    <img
                      src={`/asl_alphabet_test/${letter}_test.jpg`}
                      alt={`ASL ${letter}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                        <span className="text-white font-bold text-lg uppercase">
                          {letter}
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-md">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white uppercase">
                        {letter}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default ChatWindow;