import React from 'react';
import { FaUser, FaCircle } from 'react-icons/fa';

const ConversationList = ({ conversations, selectedConversation, onSelectConversation, isSidebarOpen }) => {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-400 mb-2">No conversations yet</div>
        <div className="text-sm text-gray-500">Start by finding users to chat with</div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
            selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
          }`}
        >
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-deafcomm-blue to-deafcomm-purple rounded-full flex items-center justify-center">
              {conversation.other_user?.avatar ? (
                <img 
                  src={conversation.other_user.avatar} 
                  alt={conversation.other_user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FaUser className="text-white" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          {/* Conversation Info */}
          {isSidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {conversation.other_user?.username || 'Unknown User'}
                </h3>
                <span className="text-xs text-gray-500">
                  {conversation.last_message_at 
                    ? new Date(conversation.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : ''
                  }
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-600 truncate">
                  {conversation.last_message?.content 
                    ? (conversation.last_message.content.length > 30 
                        ? conversation.last_message.content.substring(0, 30) + '...' 
                        : conversation.last_message.content)
                    : 'No messages yet'
                  }
                </p>
                {conversation.unread_count > 0 && (
                  <span className="bg-deafcomm-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
              <div className="flex items-center mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${conversation.other_user?.is_deaf ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {conversation.other_user?.is_deaf ? 'Deaf' : 'Hearing'}
                </span>
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default ConversationList;