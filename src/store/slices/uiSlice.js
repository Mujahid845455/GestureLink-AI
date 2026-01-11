import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  theme: 'light',
  notifications: [],
  cameraEnabled: false,
  microphoneEnabled: false,
  activeTab: 'chat',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    toggleCamera: (state) => {
      state.cameraEnabled = !state.cameraEnabled;
    },
    toggleMicrophone: (state) => {
      state.microphoneEnabled = !state.microphoneEnabled;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const { 
  toggleSidebar, 
  setTheme, 
  addNotification, 
  removeNotification,
  toggleCamera,
  toggleMicrophone,
  setActiveTab
} = uiSlice.actions;
export default uiSlice.reducer;