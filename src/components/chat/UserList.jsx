import React from 'react';
import { FaUser, FaVideo, FaComment, FaCircle } from 'react-icons/fa';

const UserList = ({ users, onStartChat, isSidebarOpen }) => {
  if (users.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-400 mb-2">No users found</div>
        <div className="text-sm text-gray-500">Try adjusting your search</div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {users.map((user) => (
        <div
          key={user.id}
          className="p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-deafcomm-blue to-deafcomm-purple rounded-full flex items-center justify-center">
                <FaUser className="text-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            {/* User Info */}
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {user.username}
                  </h3>
                  <span className="text-xs text-gray-500">Online</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-600">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full mr-2 ${user.is_deaf ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {user.is_deaf ? 'Deaf User' : 'Hearing User'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                    {user.preferred_language.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isSidebarOpen && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onStartChat(user.id)}
                  className="p-2 bg-deafcomm-blue text-white rounded-lg hover:bg-deafcomm-purple transition-colors"
                  title="Start Chat"
                >
                  <FaComment />
                </button>
                <button
                  className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  title="Video Call"
                >
                  <FaVideo />
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