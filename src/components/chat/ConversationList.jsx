import React from 'react';
import { FaUser, FaCircle } from 'react-icons/fa';

const ConversationList = ({ conversations, selectedConversation, onSelectConversation, isSidebarOpen }) => {
  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <FaUser className="text-gray-400" />
        </div>
        <div className="text-gray-500 dark:text-gray-400 font-medium mb-1">No conversations yet</div>
        <div className="text-xs text-gray-400">Start by finding users to chat with</div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border-l-2 ${selectedConversation?.id === conversation.id
              ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-500'
              : 'border-transparent'
            }`}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              {conversation.other_user?.avatar ? (
                <img
                  src={conversation.other_user.avatar}
                  alt={conversation.other_user.username}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {conversation.other_user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            {conversation.other_user?.is_online && (
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm animate-pulse"></div>
            )}
          </div>

          {/* Conversation Info */}
          {isSidebarOpen && (
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600">
                  {conversation.other_user?.username || 'Unknown User'}
                </h3>
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase">
                  {conversation.last_message_at
                    ? new Date(conversation.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : ''
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-xs truncate ${conversation.unread_count > 0 ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                  {conversation.last_message?.content
                    ? conversation.last_message.content
                    : 'No messages yet'
                  }
                </p>
                {conversation.unread_count > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm animate-bounce">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default ConversationList;