import React, { useState } from 'react';
import { FaCheck, FaCheckDouble, FaUser, FaSignLanguage, FaVolumeUp } from 'react-icons/fa';

const MessageBubble = ({ message, isOwn, user }) => {
  const [showTranslation, setShowTranslation] = useState(false);

  const getMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'sign':
        return (
          <div className={`flex items-center space-x-2 ${isOwn ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}>
            <FaSignLanguage />
            <span className="font-medium text-sm">Sign language message</span>
          </div>
        );
      case 'audio':
        return (
          <div className={`flex items-center space-x-2 ${isOwn ? 'text-purple-100' : 'text-purple-600 dark:text-purple-400'}`}>
            <FaVolumeUp />
            <span className="font-medium text-sm">Audio message</span>
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <p className={`${isOwn ? 'text-white' : 'text-gray-800 dark:text-gray-100'} text-sm leading-relaxed`}>{message.content}</p>

            {/* Translation Toggle */}
            {message.translated_text && message.translated_text !== message.content && (
              <div className="pt-1">
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 transition-colors ${isOwn
                      ? 'text-blue-100 hover:text-white'
                      : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                    }`}
                >
                  <span>{showTranslation ? 'Hide translation' : 'Show translation'}</span>
                </button>
                {showTranslation && (
                  <div className={`mt-2 p-2 rounded-lg border text-sm ${isOwn
                      ? 'bg-white/10 border-white/20 text-blue-50'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-gray-700 dark:text-gray-300'
                    }`}>
                    {message.translated_text}
                  </div>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group mb-4`}>
      <div className={`max-w-[85%] md:max-w-[75%] ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        {/* Sender Info */}
        {!isOwn && (
          <div className="flex items-center space-x-2 mb-1 pl-1">
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">
              {user?.username || 'User'}
            </span>
            {user?.is_deaf && (
              <span className="text-[9px] px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded uppercase font-bold">
                Deaf
              </span>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-2.5 shadow-sm transition-all ${isOwn
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-br-sm'
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-sm'
            }`}
        >
          {renderMessageContent()}

          {/* Message Footer */}
          <div className={`flex items-center justify-end space-x-1.5 mt-1 opacity-70 ${isOwn ? 'text-blue-50' : 'text-gray-400 dark:text-gray-500'}`}>
            <span className="text-[9px] font-medium">{getMessageTime(message.created_at)}</span>
            {isOwn && (
              <div className="flex items-center">
                {message.status === 'read' ? (
                  <FaCheckDouble className="text-[10px] text-blue-200" />
                ) : message.status === 'delivered' ? (
                  <FaCheckDouble className="text-[10px] opacity-50" />
                ) : (
                  <FaCheck className="text-[10px] opacity-50" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;