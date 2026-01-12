import React from 'react';
import { FaUser, FaVideo, FaComment, FaCircle } from 'react-icons/fa';

const UserList = ({ users, onStartChat, isSidebarOpen }) => {
  if (users.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <FaUser className="text-gray-400" />
        </div>
        <div className="text-gray-500 dark:text-gray-400 font-medium mb-1">No users found</div>
        <div className="text-xs text-gray-400">Try adjusting your search</div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {users.map((user) => (
        <div
          key={user.id || user._id}
          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer group"
          onClick={() => onStartChat(user.id || user._id)}
        >
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">
                  {user.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              {user.is_online && (
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm animate-pulse"></div>
              )}
            </div>

            {/* User Info */}
            {isSidebarOpen && (
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600">
                    {user.username}
                  </h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${user.is_online ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`}>
                    {user.is_online ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                  {user.email}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${user.is_deaf ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                    {user.is_deaf ? 'Deaf' : 'Hearing'}
                  </span>
                  {user.preferred_language && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {user.preferred_language}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Desktop Quick Actions */}
            {!isSidebarOpen && !isSidebarOpen && (
              <div className="hidden"></div>
            )}

            {isSidebarOpen && (
              <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartChat(user.id || user._id);
                  }}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  title="Message"
                >
                  <FaComment className="w-3.5 h-3.5" />
                </button>
                <button
                  className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
                  title="Video Call"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaVideo className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;