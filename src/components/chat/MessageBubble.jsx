import React, { useState } from 'react';
import { FaCheck, FaCheckDouble, FaUser, FaSignLanguage, FaVolumeUp } from 'react-icons/fa';

const MessageBubble = ({ message, isOwn, user }) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const getMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'sign':
        return (
          <div className="flex items-center space-x-2 text-deafcomm-blue">
            <FaSignLanguage />
            <span>Sign language message</span>
          </div>
        );
      case 'audio':
        return (
          <div className="flex items-center space-x-2 text-deafcomm-purple">
            <FaVolumeUp />
            <span>Audio message</span>
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <p className="text-gray-800">{message.content}</p>
            
            {/* Translation Toggle */}
            {message.translated_text && message.translated_text !== message.content && (
              <div>
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="text-xs text-deafcomm-blue hover:text-deafcomm-purple flex items-center space-x-1"
                >
                  <span>{showTranslation ? 'Hide translation' : 'Show translation'}</span>
                </button>
                {showTranslation && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-gray-700">{message.translated_text}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        {/* Sender Info for other user's messages */}
        {!isOwn && (
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-6 h-6 bg-gradient-to-r from-deafcomm-blue to-deafcomm-purple rounded-full flex items-center justify-center">
              <FaUser className="text-white text-xs" />
            </div>
            <span className="text-xs font-medium text-gray-700">
              {user?.username || 'User'}
            </span>
            {user?.is_deaf && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                Deaf
              </span>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${isOwn 
            ? 'bg-deafcomm-blue text-white rounded-br-none' 
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
          }`}
        >
          {renderMessageContent()}
          
          {/* Message Footer */}
          <div className={`flex items-center justify-between mt-2 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
            <div className="flex items-center space-x-2">
              <span className="text-xs">{getMessageTime(message.created_at)}</span>
              {isOwn && (
                <div className="flex items-center">
                  <FaCheckDouble className="text-xs" />
                </div>
              )}
            </div>
            
            {/* Message Type Indicator */}
            <div className="text-xs opacity-75">
              {message.message_type === 'sign' && '👐'}
              {message.message_type === 'audio' && '🎤'}
              {message.message_type === 'text' && '📝'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;