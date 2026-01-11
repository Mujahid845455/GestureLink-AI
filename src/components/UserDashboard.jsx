import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FaComments, 
  FaUsers, 
  FaSearch, 
  FaPlus, 
  FaVideo, 
  FaSignLanguage, 
  FaVolumeUp, 
  FaUserPlus,
  FaFilter,
  FaSort,
  FaTimes,
  FaCamera,
  FaMicrophone,
  FaRobot,
  FaBars,
  FaArrowLeft,
  FaHome
} from 'react-icons/fa';
import { getCurrentUser, logout } from '../store/slices/authSlice';
import { getConversations, getUsers } from '../store/slices/chatSlice';
import Header from '../components/common/Header';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import UserList from '../components/chat/UserList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toggleSidebar } from '../store/slices/uiSlice';
import Caption from './Caption';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);
  const { conversations, users, isLoading: chatLoading } = useSelector((state) => state.chat);
  const { sidebarOpen, activeTab } = useSelector((state) => state.ui);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowMobileSidebar(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add logout handler
  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  // Navigate to Avatar Canvas
  const navigateToAvatar = () => {
        navigate('/avatar',{replace : true});
  };

  // Stats for the dashboard
  const stats = useMemo(() => ({
    totalConversations: conversations.length,
    unreadMessages: conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0),
    onlineUsers: users.filter(u => u.is_online && u.id !== user?.id).length,
    deafUsers: users.filter(u => u.is_deaf).length,
  }), [conversations, users, user]);

  // Tabs configuration
  const tabs = useMemo(() => [
    { 
      id: 'chat', 
      name: 'Chats', 
      icon: <FaComments className="text-lg" />, 
      count: stats.totalConversations,
      badgeColor: 'bg-blue-500'
    },
    { 
      id: 'users', 
      name: 'Users', 
      icon: <FaUsers className="text-lg" />, 
      count: stats.onlineUsers,
      badgeColor: 'bg-green-500'
    },
  ], [stats]);

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations.filter(conv => 
      conv.other_user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply type filter
    if (filterType === 'unread') {
      filtered = filtered.filter(conv => conv.unread_count > 0);
    } else if (filterType === 'deaf') {
      filtered = filtered.filter(conv => conv.other_user?.is_deaf);
    } else if (filterType === 'hearing') {
      filtered = filtered.filter(conv => !conv.other_user?.is_deaf);
    }

    // Apply sorting
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
    } else if (sortBy === 'unread') {
      filtered.sort((a, b) => (b.unread_count || 0) - (a.unread_count || 0));
    } else if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => (a.other_user?.username || '').localeCompare(b.other_user?.username || ''));
    }

    return filtered;
  }, [conversations, searchQuery, filterType, sortBy]);

  // Filter users
  const filteredUsers = useMemo(() => 
    users.filter(u => 
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) && 
      u.id !== user?.id
    ),
    [users, searchQuery, user]
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if(token){
      dispatch(getCurrentUser());
    }
    dispatch(getConversations());
    dispatch(getUsers());
  }, [dispatch]);

  const handleStartChat = useCallback(async (userId) => {
    try {
      // You'll need to implement or import startNewConversation
      // const result = await dispatch(startNewConversation(userId)).unwrap();
      // setSelectedConversation(result);
      setShowNewChatModal(false);
      if (isMobile) {
        setShowMobileSidebar(false);
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  }, [dispatch, isMobile]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const handleBackToDashboard = () => {
    setSelectedConversation(null);
  };

  if (authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="relative">
          <LoadingSpinner size="large" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FaSignLanguage className="text-4xl text-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded-lg bg-blue-100 text-blue-600"
            >
              <FaBars className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">{user?.username}</h2>
                <div className="flex items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user?.is_deaf ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {user?.is_deaf ? 'Deaf' : 'Hearing'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
          >
            Logout
          </button>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && <Header onLogout={handleLogout} user={user} />}

      <div className={`flex h-screen ${isMobile ? 'pt-16' : 'h-[calc(100vh-4rem)]'}`}>
        {/* Mobile Sidebar Overlay */}
        {isMobile && showMobileSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          flex flex-col
          ${isMobile 
            ? `fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 transform transition-transform duration-300 ease-in-out ${
                showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
              } w-72`
            : sidebarOpen 
              ? 'w-64 lg:w-72 xl:w-80' 
              : 'w-16 lg:w-20'
          }
          bg-white/95 backdrop-blur-sm
          border-r border-gray-200/50
          shadow-xl
          transition-all duration-300 ease-in-out
          overflow-hidden
          z-10
        `}>
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          )}

          {/* User Info */}
          <div className="p-3 border-b border-gray-200/50 bg-gradient-to-r from-white to-blue-50/50">
            <div className="flex items-center space-x-3">
              <div className={`
                ${isMobile ? 'w-12 h-12' : 'w-10 h-10 lg:w-12 lg:h-12'}
                bg-gradient-to-br from-blue-500 to-purple-600
                rounded-xl lg:rounded-2xl
                flex items-center justify-center
                shadow-lg
                ring-2 ring-white ring-offset-1 lg:ring-offset-2
                transition-transform duration-300 hover:scale-105
                ${!sidebarOpen && !isMobile && 'mx-auto'}
              `}>
                <span className="text-white font-bold text-sm lg:text-base">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              {(sidebarOpen || isMobile) && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-gray-900 truncate">
                        {user?.username}
                      </h2>
                      <div className="flex items-center space-x-1 lg:space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user?.is_deaf ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {user?.is_deaf ? '👐' : '👂'}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ●
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Unread</div>
                      <div className="text-lg font-bold text-blue-600">{stats.unreadMessages}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 bg-gradient-to-b from-white to-gray-50/30">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-blue-600">
                <FaSearch className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder={(sidebarOpen || isMobile) ? "Search..." : ""}
                value={searchQuery}
                onChange={handleSearchChange}
                className={`
                  w-full
                  ${(sidebarOpen || isMobile) ? 'pl-10 pr-8' : 'px-3 text-center'}
                  py-2
                  bg-white/50
                  border border-gray-300/50
                  rounded-lg lg:rounded-xl
                  focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                  backdrop-blur-sm
                  placeholder:text-gray-400
                  text-sm
                  transition-all duration-200
                  ${!sidebarOpen && !isMobile && 'hover:bg-white'}
                `}
              />
              {(sidebarOpen || isMobile) && searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200 hover:text-gray-700"
                >
                  <FaTimes className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>

            {/* Filters & Sort */}
            {(sidebarOpen || isMobile) && activeTab === 'chat' && (
              <div className="flex items-center space-x-2 mt-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs bg-white/50 border border-gray-300/50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-400"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="deaf">Deaf</option>
                  <option value="hearing">Hearing</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs bg-white/50 border border-gray-300/50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-400"
                >
                  <option value="recent">Recent</option>
                  <option value="unread">Unread First</option>
                  <option value="alphabetical">A-Z</option>
                </select>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="px-2">
            <div className="flex border-b border-gray-200/50">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    dispatch({ type: 'ui/setActiveTab', payload: tab.id });
                    if (isMobile) setShowMobileSidebar(false);
                  }}
                  className={`
                    flex-1 flex items-center justify-center py-2 lg:py-3
                    text-sm font-medium
                    transition-all duration-200
                    relative
                    ${activeTab === tab.id 
                      ? 'text-blue-600 border-b-2 border-blue-500 bg-gradient-to-t from-blue-50/50 to-transparent' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                    }
                  `}
                >
                  <div className="relative flex items-center">
                    <span className="text-base lg:text-lg">{tab.icon}</span>
                    {(sidebarOpen || isMobile) && tab.count > 0 && (
                      <span className={`
                        absolute -top-1 -right-1 lg:-top-2 lg:-right-2
                        ${tab.badgeColor} text-white
                        text-xs rounded-full 
                        w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center
                        animate-pulse
                      `}>
                        {tab.count > 9 ? '9+' : tab.count}
                      </span>
                    )}
                  </div>
                  {(sidebarOpen || isMobile) && (
                    <span className="ml-2 text-xs lg:text-sm">{tab.name}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {activeTab === 'chat' ? (
              <ConversationList 
                conversations={filteredConversations}
                selectedConversation={selectedConversation}
                onSelectConversation={(conv) => {
                  setSelectedConversation(conv);
                  if (isMobile) setShowMobileSidebar(false);
                }}
                isSidebarOpen={sidebarOpen || isMobile}
                isMobile={isMobile}
              />
            ) : (
              <UserList 
                users={filteredUsers}
                onStartChat={handleStartChat}
                isSidebarOpen={sidebarOpen || isMobile}
                isMobile={isMobile}
              />
            )}
          </div>

          {/* New Chat Button */}
          <div className="p-3 border-t border-gray-200/50 bg-gradient-to-t from-white to-transparent">
            <button
              onClick={() => setShowNewChatModal(true)}
              className={`
                w-full flex items-center justify-center space-x-2
                py-2 lg:py-3
                bg-gradient-to-r from-blue-500 to-purple-600
                text-white
                rounded-lg lg:rounded-xl
                hover:from-blue-600 hover:to-purple-700
                hover:shadow-lg
                active:scale-95
                transition-all duration-200
                ${!sidebarOpen && !isMobile && 'px-3'}
              `}
            >
              <FaPlus className="h-4 w-4 lg:h-5 lg:w-5" />
              {(sidebarOpen || isMobile) && <span className="font-semibold text-sm lg:text-base">New Chat</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 flex flex-col overflow-hidden ${isMobile && selectedConversation ? 'fixed inset-0 z-30 bg-white' : ''}`}>
          {selectedConversation ? (
            <>
              {/* Mobile Chat Header */}
              {isMobile && (
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-3 flex items-center justify-between">
                  <button
                    onClick={handleBackToDashboard}
                    className="flex items-center space-x-2 text-blue-600"
                  >
                    <FaArrowLeft className="h-5 w-5" />
                    <span>Back</span>
                  </button>
                  <div className="text-center">
                    <h2 className="font-semibold text-gray-900">
                      {selectedConversation.other_user?.username || 'Chat'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-2"
                  >
                    <FaHome className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              )}
              <ChatWindow 
                conversation={selectedConversation}
                currentUser={user}
                onBack={handleBackToDashboard}
                isMobile={isMobile}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 overflow-y-auto">
              <div className="w-full max-w-6xl text-center space-y-6 md:space-y-8">
                {/* Hero Section */}
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 md:mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl md:rounded-3xl blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl">
                      <FaSignLanguage className="text-white text-3xl md:text-5xl animate-float" />
                    </div>
                  </div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">GestureLink AI</span>
                  </h1>
                  <p className="text-base md:text-lg text-gray-600 max-w-md md:max-w-lg mx-auto px-4">
                    {user?.is_deaf 
                      ? 'Start communicating by selecting a conversation or using sign language recognition.'
                      : 'Select a conversation to start chatting or see messages translated to sign language.'
                    }
                  </p>
                </div>

                {/* Stats - Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                  {[
                    { label: 'Total Chats', value: stats.totalConversations, color: 'bg-blue-500', icon: '💬' },
                    { label: 'Unread', value: stats.unreadMessages, color: 'bg-red-500', icon: '🔔' },
                    { label: 'Online', value: stats.onlineUsers, color: 'bg-green-500', icon: '🟢' },
                    { label: 'Deaf Users', value: stats.deafUsers, color: 'bg-purple-500', icon: '👐' },
                  ].map((stat, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-200/50 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-xs md:text-sm text-gray-500">{stat.label}</p>
                          <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 ${stat.color} rounded-lg md:rounded-xl flex items-center justify-center text-white`}>
                          <span className="text-lg md:text-xl">{stat.icon}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Features - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[
                    {
                      icon: <FaCamera className="text-xl md:text-2xl" />,
                      title: 'Camera Signing',
                      description: 'Use your webcam for real-time sign language recognition',
                      gradient: 'from-blue-500 to-blue-600',
                      bg: 'bg-blue-50',
                      onClick: () => {} // Add your camera feature handler
                    },
                    {
                      icon: <FaMicrophone className="text-xl md:text-2xl" />,
                      title: 'Text-to-Speech',
                      description: 'Convert text messages to natural sounding speech',
                      gradient: 'from-purple-500 to-purple-600',
                      bg: 'bg-purple-50',
                      onClick: () => {} // Add your TTS feature handler
                    },
                    {
                      icon: <FaRobot className="text-xl md:text-2xl" />,
                      title: '3D Avatar',
                      description: 'Visualize sign language with animated 3D characters',
                      gradient: 'from-teal-500 to-teal-600',
                      bg: 'bg-teal-50',
                      onClick: navigateToAvatar // Navigate to Avatar Canvas
                    },
                  ].map((feature, index) => (
                    <button
                      key={index}
                      onClick={feature.onClick}
                      className={`${feature.bg} p-4 md:p-5 rounded-xl md:rounded-2xl border border-gray-200/50 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 text-left`}
                    >
                      <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r ${feature.gradient} rounded-lg md:rounded-xl flex items-center justify-center text-white mb-3 md:mb-4 mx-auto`}>
                        {feature.icon}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1 md:mb-2">{feature.title}</h3>
                      <p className="text-xs md:text-sm text-gray-600">{feature.description}</p>
                    </button>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => {
                    dispatch({ type: 'ui/setActiveTab', payload: 'users' });
                    if (isMobile) setShowMobileSidebar(true);
                  }}
                  className="inline-flex items-center space-x-2 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl md:rounded-2xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group mx-auto"
                >
                  <FaUserPlus className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="font-semibold text-sm md:text-base">Find People to Chat With</span>
                  <svg className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Chat Modal - Responsive */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-3xl w-full max-w-sm md:max-w-lg shadow-2xl border border-white/20 animate-slide-up">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Start New Conversation</h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="relative mb-4 md:mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-11 pr-4 py-2 md:py-3 bg-white border border-gray-300/50 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  onChange={handleSearchChange}
                />
              </div>

              <div className="space-y-2 max-h-64 md:max-h-96 overflow-y-auto scrollbar-thin">
                {users.length > 0 ? (
                  users.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleStartChat(user.id)}
                      className="w-full flex items-center space-x-3 p-3 md:p-4 rounded-lg md:rounded-xl hover:bg-blue-50/50 transition-all duration-200 group border border-transparent hover:border-blue-200"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                          <span className="text-white font-bold text-sm md:text-base">
                            {user.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {user.is_online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 text-sm md:text-base">{user.username}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_deaf ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {user.is_deaf ? 'Deaf' : 'Hearing'}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-500">Click to start chatting</p>
                      </div>
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-6 md:py-8">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <FaUsers className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-sm md:text-base">No users found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add custom animations to Tailwind config
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slide-up {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
  .animate-slide-up {
    animation: slide-up 0.4s ease-out;
  }
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 2px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.5);
  }

  /* Mobile-specific styles */
  @media (max-width: 640px) {
    .mobile-tap-target {
      min-height: 44px;
      min-width: 44px;
    }
  }
`;

export default UserDashboard;