// src/components/UserDashboard.js
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
import { getConversations, getUsers, createConversation, updateUserStatus } from '../store/slices/chatSlice';
import Header from '../components/common/Header';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import UserList from '../components/chat/UserList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import socketService from '../services/socketService';

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
  const [socketConnected, setSocketConnected] = useState(false);

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);

      // If mobile view and chat is open, close sidebar
      if (isMobileView && selectedConversation) {
        setShowMobileSidebar(false);
      }

      // Reset sidebar for desktop view
      if (window.innerWidth >= 768) {
        setShowMobileSidebar(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [selectedConversation]);

  // Socket connection
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && user) {
      socketService.connect(token);

      const unsubConnect = socketService.onConnect(() => {
        setSocketConnected(true);
        console.log('Socket connected');
      });

      const unsubOnline = socketService.onUserOnline((userId) => {
        dispatch(updateUserStatus({ userId, isOnline: true }));
      });

      const unsubOffline = socketService.onUserOffline((userId) => {
        dispatch(updateUserStatus({ userId, isOnline: false }));
      });

      return () => {
        unsubConnect();
        unsubOnline();
        unsubOffline();
        socketService.disconnect();
        setSocketConnected(false);
      };
    }
  }, [user, dispatch]);

  // Load data on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      dispatch(getCurrentUser());
    }
    dispatch(getConversations());
    dispatch(getUsers());
  }, [dispatch]);

  // Join conversation room when selected
  useEffect(() => {
    if (selectedConversation?.id && socketConnected) {
      socketService.joinConversation(selectedConversation.id);
    }
  }, [selectedConversation, socketConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (selectedConversation?.id && socketConnected) {
        socketService.leaveConversation(selectedConversation.id);
      }
    };
  }, [selectedConversation, socketConnected]);

  // Logout handler
  const handleLogout = () => {
    socketService.disconnect();
    dispatch(logout());
    navigate('/login');
  };

  // Navigate to Avatar Canvas
  const navigateToAvatar = () => {
    navigate('/avatar', { replace: true });
  };

  // Stats for the dashboard
  const stats = useMemo(() => ({
    totalConversations: conversations.length,
    unreadMessages: conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0),
    onlineUsers: users.filter(u => u.is_online && (u.id || u._id) !== (user?.id || user?._id)).length,
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

  // Filter users for user list (Discovery tab)
  const filteredUsers = useMemo(() =>
    users.filter(u => {
      const uId = u.id || u._id;
      const currentId = user?.id || user?._id;
      return (
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        uId !== currentId
      );
    }),
    [users, searchQuery, user]
  );

  // Filter users for the New Chat modal
  const newChatFilteredUsers = useMemo(() => users.filter((u) => {
    // 1. Never show current user
    if ((u.id || u._id) === (user?.id || user?._id)) return false;

    // 2. Hide users who already have a conversation
    const hasConversation = conversations.some(
      (c) => (c.other_user?.id || c.other_user?._id) === (u.id || u._id)
    );

    // 3. Search filter
    const matchesSearch = u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return !hasConversation && matchesSearch;
  }), [users, user, searchQuery, conversations]);

  // Handle starting a new chat
  const handleStartChat = async (userId) => {
    try {
      console.log('Starting chat with user:', userId);

      // Leave previous conversation if exists
      if (selectedConversation?.id && socketConnected) {
        socketService.leaveConversation(selectedConversation.id);
      }

      // Check if conversation already exists
      const existingConv = conversations.find(conv =>
        conv.other_user?._id === userId || conv.other_user?.id === userId
      );

      if (existingConv) {
        // Conversation exists, just select it
        setSelectedConversation(existingConv);
        setShowNewChatModal(false);
        dispatch({ type: 'ui/setActiveTab', payload: 'chat' });

        if (isMobile) {
          setShowMobileSidebar(false);
        }
        return;
      }

      // Create new conversation
      const resultAction = await dispatch(createConversation(userId));

      if (createConversation.fulfilled.match(resultAction)) {
        // Get the newly created conversation
        const newConversation = resultAction.payload.conversation || resultAction.payload;

        // Format conversation for frontend
        const formattedConversation = {
          id: newConversation._id || newConversation.id,
          other_user: resultAction.payload.other_user ||
            newConversation.participants?.find(p => (p._id || p.id) !== (user?._id || user?.id)) ||
            { id: userId, username: 'User' },
          last_message: null,
          last_message_at: newConversation.created_at || newConversation.createdAt,
          unread_count: 0
        };

        // Update conversations list
        dispatch(getConversations());

        // Set as selected conversation
        setSelectedConversation(formattedConversation);
        setShowNewChatModal(false);
        setSearchQuery('');

        // Switch to chat tab
        dispatch({ type: 'ui/setActiveTab', payload: 'chat' });

        // Join socket room
        if (socketService.isConnected()) {
          socketService.joinConversation(formattedConversation.id);
        }

        if (isMobile) {
          setShowMobileSidebar(false);
        }

        console.log('Chat started successfully:', formattedConversation);
      } else {
        throw new Error(resultAction.payload?.error || 'Failed to create conversation');
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
      alert(`Failed to start chat: ${error.message}`);
    }
  };

  // Handle selecting an existing conversation
  const handleSelectConversation = useCallback((conversation) => {
    console.log('Selecting conversation:', conversation);

    // Set the new conversation
    setSelectedConversation(conversation);
    dispatch({ type: 'ui/setActiveTab', payload: 'chat' });

    // In mobile, close sidebar when chat opens
    if (isMobile) {
      setShowMobileSidebar(false);
    }
  }, [dispatch, isMobile]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    console.log('handleBackToDashboard - Going back to dashboard');

    // Clear the selected conversation
    setSelectedConversation(null);

    // In mobile view, open sidebar to show conversations
    if (isMobile) {
      setShowMobileSidebar(true);
    }

    // Switch to chat tab in sidebar
    dispatch({ type: 'ui/setActiveTab', payload: 'chat' });

    // Clear search
    setSearchQuery('');

    // Force UI update
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
  }, [dispatch, isMobile, selectedConversation, socketConnected]);

  const toggleMobileSidebar = useCallback(() => {
    // If chat is open and we're on mobile, close chat first
    if (selectedConversation && isMobile) {
      handleBackToDashboard();
    } else {
      setShowMobileSidebar(prev => !prev);
    }
  }, [selectedConversation, isMobile, handleBackToDashboard]);

  if (authLoading && !user) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="relative">
          <LoadingSpinner size="large" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FaSignLanguage className="text-4xl text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 overflow-hidden">
      {/* Mobile Header - Hidden when chat is open to avoid overlay issues */}
      {isMobile && !selectedConversation && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
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
                <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">{user?.username}</h2>
                <div className="flex items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user?.is_deaf ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'}`}>
                    {user?.is_deaf ? 'Deaf' : 'Hearing'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
          >
            Logout
          </button>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && <Header onLogout={handleLogout} user={user} />}

      <div className={`flex flex-1 overflow-hidden ${isMobile && !selectedConversation ? 'pt-16' : ''}`}>
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
            ? `fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 transform transition-transform duration-300 ease-in-out ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
            } w-72`
            : sidebarOpen
              ? 'w-64 lg:w-72 xl:w-80'
              : 'w-16 lg:w-20'
          }
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm
          border-r border-gray-200/50 dark:border-gray-800
          shadow-xl
          transition-all duration-300 ease-in-out
          overflow-hidden
          z-10
        `}>
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          )}

          {/* User Info */}
          <div className="p-3 border-b border-gray-200/50 dark:border-gray-800 bg-gradient-to-r from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-900/20">
            <div className="flex items-center space-x-3">
              <div className={`
                ${isMobile ? 'w-12 h-12' : 'w-10 h-10 lg:w-12 lg:h-12'}
                bg-gradient-to-br from-blue-500 to-purple-600
                rounded-xl lg:rounded-2xl
                flex items-center justify-center
                shadow-lg
                ring-2 ring-white dark:ring-gray-800 ring-offset-1 lg:ring-offset-2
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
                      <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                        {user?.username}
                      </h2>
                      <div className="flex items-center space-x-1 lg:space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user?.is_deaf ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'}`}>
                          {user?.is_deaf ? '👐' : '👂'}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                          ●
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Unread</div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.unreadMessages}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 bg-gradient-to-b from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
                <FaSearch className="h-4 w-4 text-gray-400" />
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
                  bg-white/50 dark:bg-gray-800/50
                  border border-gray-300/50 dark:border-gray-700
                  rounded-lg lg:rounded-xl
                  focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                  backdrop-blur-sm
                  placeholder:text-gray-400
                  text-sm text-gray-900 dark:text-gray-100
                  transition-all duration-200
                  ${!sidebarOpen && !isMobile && 'hover:bg-white dark:hover:bg-gray-800'}
                `}
              />
              {(sidebarOpen || isMobile) && searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200 hover:text-gray-700 dark:hover:text-gray-300"
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
                  className="flex-1 px-2 py-1.5 text-xs bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-400 text-gray-700 dark:text-gray-200"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="deaf">Deaf</option>
                  <option value="hearing">Hearing</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-400 text-gray-700 dark:text-gray-200"
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
            <div className="flex border-b border-gray-200/50 dark:border-gray-800">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    dispatch({ type: 'ui/setActiveTab', payload: tab.id });
                    setSearchQuery('');
                    if (isMobile) setShowMobileSidebar(false);
                  }}
                  className={`
                    flex-1 flex items-center justify-center py-2 lg:py-3
                    text-sm font-medium
                    transition-all duration-200
                    relative
                    ${activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-gradient-to-t from-blue-50/50 to-transparent dark:from-blue-900/20'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
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
                onSelectConversation={handleSelectConversation}
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
          <div className="p-3 border-t border-gray-200/50 dark:border-gray-800 bg-gradient-to-t from-white to-transparent dark:from-gray-900">
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
        <main className={`
          flex-1 flex flex-col overflow-hidden relative
          transition-all duration-300
          ${isMobile && selectedConversation
            ? 'fixed inset-0 z-60 bg-white dark:bg-gray-900'
            : ''
          }
        `}>
          {selectedConversation ? (
            <div className="flex-1 flex flex-col h-full">
              <ChatWindow
                conversation={selectedConversation}
                currentUser={user}
                onBack={handleBackToDashboard}
                isMobile={isMobile}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 overflow-y-auto">
              <div className="w-full max-w-6xl text-center space-y-6 md:space-y-8">
                {/* Hero Section */}
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 md:mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl md:rounded-3xl blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl">
                      <FaSignLanguage className="text-white text-3xl md:text-5xl" />
                    </div>
                  </div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 md:mb-3">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">GestureLink AI</span>
                  </h1>
                  <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-md md:max-w-lg mx-auto px-4">
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
                    <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
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
                      bg: 'bg-blue-50 dark:bg-blue-900/20',
                      onClick: () => { }
                    },
                    {
                      icon: <FaMicrophone className="text-xl md:text-2xl" />,
                      title: 'Text-to-Speech',
                      description: 'Convert text messages to natural sounding speech',
                      gradient: 'from-purple-500 to-purple-600',
                      bg: 'bg-purple-50 dark:bg-purple-900/20',
                      onClick: () => { }
                    },
                    {
                      icon: <FaRobot className="text-xl md:text-2xl" />,
                      title: '3D Avatar',
                      description: 'Visualize sign language with animated 3D characters',
                      gradient: 'from-teal-500 to-teal-600',
                      bg: 'bg-teal-50 dark:bg-teal-900/20',
                      onClick: navigateToAvatar
                    },
                  ].map((feature, index) => (
                    <button
                      key={index}
                      onClick={feature.onClick}
                      className={`${feature.bg} p-4 md:p-5 rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 text-left`}
                    >
                      <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r ${feature.gradient} rounded-lg md:rounded-xl flex items-center justify-center text-white mb-3 md:mb-4 mx-auto`}>
                        {feature.icon}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base mb-1 md:mb-2">{feature.title}</h3>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
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
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl md:rounded-3xl w-full max-w-sm md:max-w-lg shadow-2xl border border-white/20 dark:border-gray-800 animate-slide-up">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">Start New Conversation</h3>
                <button
                  onClick={() => {
                    setShowNewChatModal(false);
                    setSearchQuery('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <FaTimes className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="relative mb-4 md:mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-11 pr-4 py-2 md:py-3 bg-white dark:bg-gray-800 border border-gray-300/50 dark:border-gray-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="space-y-2 max-h-64 md:max-h-96 overflow-y-auto scrollbar-thin">
                {newChatFilteredUsers.length > 0 ? (
                  newChatFilteredUsers.map(user => (
                    <button
                      key={user.id || user._id}
                      onClick={() => handleStartChat(user.id || user._id)}
                      className="w-full flex items-center space-x-3 p-3 md:p-4 rounded-lg md:rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 group border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                          <span className="text-white font-bold text-sm md:text-base">
                            {user.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {user.is_online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm md:text-base">{user.username}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_deaf ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'}`}>
                            {user.is_deaf ? 'Deaf' : 'Hearing'}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-600 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-6 md:py-8">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <FaUsers className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                      {searchQuery ? 'No users found' : 'No users available to chat'}
                    </p>
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

export default UserDashboard;
