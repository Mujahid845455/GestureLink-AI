// // store/slices/authSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// const API_URL = 'https://gesturelink-ai-backend.onrender.com/api/auth';

// // Async thunks for API calls
// export const loginUser = createAsyncThunk(
//   'auth/login',
//   async ({ username, password }, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(`${API_URL}/login`, {
//         identifier: username,
//         password
//       });
      
//       // Save token to localStorage
//       localStorage.setItem('access_token', response.data.access_token);
//       localStorage.setItem('user', JSON.stringify(response.data.user));
      
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { error: 'Login failed' });
//     }
//   }
// );

// export const signupUser = createAsyncThunk(
//   'auth/signup',
//   async ({ username, email, password, userType }, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(`${API_URL}/signup`, {
//         username,
//         email,
//         password,
//         userType
//       });
      
//       // Save token to localStorage
//       localStorage.setItem('access_token', response.data.access_token);
//       localStorage.setItem('user', JSON.stringify(response.data.user));
      
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { error: 'Signup failed' });
//     }
//   }
// );

// export const getCurrentUser = createAsyncThunk(
//   'auth/me',
//   async (_, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem('access_token');
//       if (!token) {
//         throw new Error('No token found');
//       }
      
//       const response = await axios.get(`${API_URL}/me`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { error: 'Failed to get user' });
//     }
//   }
// );

// const authSlice = createSlice({
//   name: 'auth',
//   initialState: {
//   user: JSON.parse(localStorage.getItem("user")) || null,
//   token: localStorage.getItem("access_token"),
//   isLoading: false,
//   error: null,
//   isAuthenticated: !!localStorage.getItem("access_token")
// },
//   reducers: {
//     logout: (state) => {
//       localStorage.removeItem('access_token');
//       localStorage.removeItem('user');
//       state.user = null;
//       state.token = null;
//       state.isAuthenticated = false;
//       state.error = null;
//     },
//     clearError: (state) => {
//       state.error = null;
//     }
//   },
//   extraReducers: (builder) => {
//   builder
//     // Login
//     .addCase(loginUser.pending, (state) => {
//       state.isLoading = true;
//       state.error = null;
//     })
//     .addCase(loginUser.fulfilled, (state, action) => {
//       state.isLoading = false;
//       state.user = action.payload.user;
//       state.token = action.payload.access_token;
//       state.isAuthenticated = true;
//       state.error = null;
//     })
//     .addCase(loginUser.rejected, (state, action) => {
//       state.isLoading = false;
//       state.error = action.payload?.error || 'Login failed';
//     })

//     // Signup
//     .addCase(signupUser.pending, (state) => {
//       state.isLoading = true;
//       state.error = null;
//     })
//     .addCase(signupUser.fulfilled, (state, action) => {
//       state.isLoading = false;
//       state.isAuthenticated = true;
//       state.user = action.payload.user;
//       state.token = action.payload.access_token;
//       state.error = null;
//     })
//     .addCase(signupUser.rejected, (state, action) => {
//       state.isLoading = false;
//       state.error = action.payload?.error || 'Signup failed';
//     })

//     // Get Current User
//     .addCase(getCurrentUser.pending, (state) => {
//       state.isLoading = true;
//     })
//     .addCase(getCurrentUser.fulfilled, (state, action) => {
//       state.isLoading = false;
//       state.user = action.payload.user;
//       state.isAuthenticated = true;
//     })
//     .addCase(getCurrentUser.rejected, (state) => {
//       state.isLoading = false;
//     });
// }

// });

// export const { logout, clearError } = authSlice.actions;
// export default authSlice.reducer;








import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://gesturelink-ai-backend.onrender.com/api/auth";

/* ================= LOGIN ================= */
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/login`, {
        identifier: username,
        password,
      });

      // ✅ BACKEND SENDS: token
      localStorage.setItem("access_token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: "Login failed" });
    }
  }
);

/* ================= SIGNUP ================= */
export const signupUser = createAsyncThunk(
  "auth/signup",
  async ({ username, email, password, userType }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/signup`, {
        username,
        email,
        password,
        userType,
      });

      localStorage.setItem("access_token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: "Signup failed" });
    }
  }
);

/* ================= ME ================= */
export const getCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token");

      const res = await axios.get(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: "Auth failed" });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("access_token"),
    isAuthenticated: !!localStorage.getItem("access_token"),
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token; // ✅ FIX
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token; // ✅ FIX
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
