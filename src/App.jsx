import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Login from './pages/Login';
import SignUp from './pages/Sign';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import AvatarCanvas from './components/AvatarCanvas';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const ThemeHandler = () => {
  const { theme } = useSelector((state) => state.ui);
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  return null;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeHandler />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/avatar"
            element={
              <ProtectedRoute>
                <AvatarCanvas />
              </ProtectedRoute>
            } />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/" element={<Navigate to="/login" />} /> */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;