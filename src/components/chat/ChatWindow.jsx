import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPaperPlane, FaCamera, FaVideo, FaPhone, FaEllipsisV, FaSmile, FaImage, FaFile, FaMicrophone, FaSignLanguage } from 'react-icons/fa';
import { sendMessage, getMessages } from '../../store/slices/chatSlice';
import MessageBubble from './MessageBubble';
import CameraFeed from '../camera/CameraFeed';

const ChatWindow = ({ conversation, currentUser }) => {
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state) => state.chat);
  const { cameraEnabled } = useSelector((state) => state.ui);

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversation?.id) {
      dispatch(getMessages(conversation.id));
    }
  }, [dispatch, conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messageData = {
      type: 'text',
      content: message,
      original_text: message,
      translated_text: message, // In real app, this would be translated
    };

    await dispatch(sendMessage({
      conversationId: conversation.id,
      message: messageData
    }));

    setMessage('');
    setIsTyping(false);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      // In real app, send typing indicator via WebSocket
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-deafcomm-blue to-deafcomm-purple rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {conversation.other_user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {conversation.other_user?.username || 'Unknown User'}
              </h2>
              <p className="text-sm text-gray-500">
                {conversation.other_user?.is_deaf ? 'Deaf user - Use sign language' : 'Hearing user - Type messages'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-deafcomm-blue hover:bg-gray-100 rounded-lg">
              <FaPhone />
            </button>
            <button className="p-2 text-gray-600 hover:text-deafcomm-blue hover:bg-gray-100 rounded-lg">
              <FaVideo />
            </button>
            <button className="p-2 text-gray-600 hover:text-deafcomm-blue hover:bg-gray-100 rounded-lg">
              <FaEllipsisV />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-deafcomm-blue"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">👋</div>
            <p className="text-lg font-medium mb-2">Start the conversation!</p>
            <p className="text-sm">
              {currentUser?.is_deaf 
                ? 'Use the camera below to sign your first message'
                : 'Type your first message below'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_id === currentUser?.id}
                user={msg.sender_id === currentUser?.id ? currentUser : conversation.other_user}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Camera Feed (for deaf users) */}
      {cameraEnabled && currentUser?.is_deaf && (
        <div className="border-t border-gray-200">
          <CameraFeed />
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-deafcomm-blue hover:bg-gray-100 rounded-lg">
              <FaImage />
            </button>
            <button className="p-2 text-gray-600 hover:text-deafcomm-blue hover:bg-gray-100 rounded-lg">
              <FaFile />
            </button>
            <button className="p-2 text-gray-600 hover:text-deafcomm-blue hover:bg-gray-100 rounded-lg">
              <FaSmile />
            </button>
            {currentUser?.is_deaf && (
              <button className="p-2 text-gray-600 hover:text-deafcomm-blue hover:bg-gray-100 rounded-lg">
                <FaSignLanguage />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-deafcomm-blue hover:bg-gray-100 rounded-lg">
              <FaMicrophone />
            </button>
            <button className="p-2 text-gray-600 hover:text-deafcomm-blue hover:bg-gray-100 rounded-lg">
              <FaCamera />
            </button>
          </div>
        </div>

        {/* Message Form */}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={handleTyping}
              placeholder={
                currentUser?.is_deaf 
                  ? "Type message or use camera to sign..."
                  : "Type your message here..."
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deafcomm-blue focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-6 py-3 bg-deafcomm-blue text-white rounded-lg hover:bg-deafcomm-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>Send</span>
            <FaPaperPlane />
          </button>
        </form>

        {/* Helper Text */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          {currentUser?.is_deaf ? (
            <p>Press the camera icon to enable sign language detection</p>
          ) : (
            <p>Your messages will be converted to sign language for deaf users</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;