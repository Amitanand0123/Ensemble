import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Helper function to handle errors
const handleError = (error) => {
  return error.response?.data?.message || error.message || 'An error occurred';
};

// Fetch all users
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      // Transform array to object with user IDs as keys for easier lookup
      const usersObject = response.data.reduce((acc, user) => {
        acc[user._id] = user;
        return acc;
      }, {});
      return usersObject;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

// Fetch a single user by ID
export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

// Search users
export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (query, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/search?query=${query}`);
      // Transform array to object with user IDs as keys
      const usersObject = response.data.reduce((acc, user) => {
        acc[user._id] = user;
        return acc;
      }, {});
      return usersObject;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

// Initial state
const initialState = {
  users: {},  // Object with user IDs as keys for efficient lookups
  selectedUser: null,
  isLoading: false,
  error: null,
  searchResults: {}
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.error = null;
    },
    selectUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = {};
    },
    // Add a single user manually (useful when receiving user data from sockets or other parts of the app)
    addOrUpdateUser: (state, action) => {
      const user = action.payload;
      state.users[user._id] = { ...state.users[user._id], ...user };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch users reducers
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = { ...state.users, ...action.payload };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch single user reducers
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        const user = action.payload;
        state.users[user._id] = user;
        state.selectedUser = user;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Search users reducers
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
        // Also add to main users object for future reference
        state.users = { ...state.users, ...action.payload };
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const { 
  clearUsersError, 
  selectUser, 
  clearSelectedUser, 
  clearSearchResults,
  addOrUpdateUser
} = usersSlice.actions;

// Selectors
export const selectAllUsers = (state) => state.users.users;
export const selectUserById = (userId) => (state) => state.users.users[userId];
export const selectSearchResults = (state) => state.users.searchResults;
export const selectSelectedUser = (state) => state.users.selectedUser;
export const selectIsLoadingUsers = (state) => state.users.isLoading;
export const selectUsersError = (state) => state.users.error;

export default usersSlice.reducer;