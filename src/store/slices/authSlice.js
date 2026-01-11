import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

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
