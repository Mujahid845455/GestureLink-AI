import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaSignLanguage, FaUser, FaCog, FaSignOutAlt, FaBell, FaSun, FaMoon, FaGraduationCap, FaBrain } from 'react-icons/fa';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar, setTheme } from '../../store/slices/uiSlice';

const Header = ({ onLearningClick, onTextToSignClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme, sidebarOpen } = useSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Toggle Sidebar Button */}
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className={`h-0.5 bg-gray-600 dark:bg-gray-400 ${sidebarOpen ? 'w-4' : 'w-6'} transition-all`}></div>
                <div className="h-0.5 bg-gray-600 dark:bg-gray-400 w-6"></div>
                <div className={`h-0.5 bg-gray-600 dark:bg-gray-400 ${sidebarOpen ? 'w-4' : 'w-6'} transition-all`}></div>
              </div>
            </button>

            <div className="flex items-center space-x-2">
              <FaSignLanguage className="text-blue-600 dark:text-blue-400 text-2xl" />
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Gesture<span className="text-blue-600 dark:text-blue-400">Link</span>
              </h1>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Text-to-Sign Icon - Always visible */}
            <button
              onClick={onTextToSignClick}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Text to Sign Language"
            >
              <FaBrain className="text-purple-600 dark:text-purple-400 text-lg md:text-xl" />
            </button>

            {/* Learning Icon - Always visible */}
            <button
              onClick={onLearningClick}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Learning & Tutorials"
            >
              <FaGraduationCap className="text-blue-600 dark:text-blue-400 text-lg md:text-xl" />
            </button>

            {/* Theme toggle - Hidden on mobile */}
            <button
              onClick={toggleTheme}
              className="hidden md:block p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <FaMoon className="text-gray-600" />
              ) : (
                <FaSun className="text-yellow-500" />
              )}
            </button>

            {/* Notifications - Hidden on mobile */}
            <button className="hidden md:block relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <FaBell className="text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-sm" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:inline">
                  {user?.username || 'User'}
                </span>
              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FaUser className="mr-3" />
                    Profile
                  </button>
                  <button
                    onClick={() => navigate('/settings')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FaCog className="mr-3" />
                    Settings
                  </button>

                  {/* Mobile-only theme toggle in dropdown */}
                  <button
                    onClick={toggleTheme}
                    className="md:hidden flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {theme === 'light' ? (
                      <>
                        <FaMoon className="mr-3" />
                        Dark Mode
                      </>
                    ) : (
                      <>
                        <FaSun className="mr-3" />
                        Light Mode
                      </>
                    )}
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FaSignOutAlt className="mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;