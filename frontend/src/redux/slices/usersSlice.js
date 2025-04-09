// --- START OF FILE frontend/src/redux/slices/usersSlice.js ---

// frontend/src/redux/slices/usersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { updateUser } from '../slices/authSlice.js'; // Import updateUser from authSlice

// Helper function to handle errors
const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'An error occurred';
  console.error("User Slice Error:", error.response?.data || error);
  return message;
};

// --- Thunks ---

// Fetch all users (for admin)
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Keep as array for admin list display
      return response.data.users || [];
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

// Fetch a single user by ID (for profile page)
export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (userId, { getState, rejectWithValue }) => {
    // --- Resolve 'me' to actual user ID ---
    const state = getState();
    const loggedInUserId = state.auth.user?._id;
    const actualUserId = userId === 'me' ? loggedInUserId : userId;

    if (!actualUserId) {
      console.error("[fetchUserById] Could not determine user ID to fetch.");
      return rejectWithValue('User ID could not be determined.');
    }
    // --------------------------------------

    console.log(`[fetchUserById] Attempting to fetch profile for ID: ${actualUserId}`);
    try {
      const token = state.auth.token; // Get token again within try block
      if (!token) {
        return rejectWithValue('Authentication token not found.');
      }
      const response = await axios.get(`/api/users/${actualUserId}`, { // Use actualUserId
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("[fetchUserById] Profile data received:", response.data.user);
      return response.data.user;
    } catch (error) {
      console.error(`[fetchUserById] Error fetching profile for ID ${actualUserId}:`, error);
      return rejectWithValue(handleError(error));
    }
  }
);

// Update logged-in user's avatar
export const updateUserAvatar = createAsyncThunk(
  'users/updateAvatar',
  async (formData, { getState, rejectWithValue, dispatch }) => { // Added dispatch
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?._id; // Get logged-in user ID
      if (!userId) {
          return rejectWithValue('User not logged in for avatar update.');
      }

      const response = await axios.patch('/api/users/me/avatar', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Axios sets this for FormData
        },
      });
      // Dispatch action to update auth slice as well
      dispatch(updateUser({ avatar: response.data.avatar })); // Update auth state immediately
      // Return data needed to update usersSlice state
      return { userId, avatar: response.data.avatar }; // Contains { success: true, message: '...', avatar: {...} } from backend, we extract avatar
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

// Update user role (for admin)
export const updateUserRole = createAsyncThunk(
    'users/updateRole',
    async ({ userId, role }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.patch(
                `/api/users/${userId}/role`,
                { role },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data.user; // Return the updated user object
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);


// --- Initial State ---
const initialState = {
  usersList: [], // For admin list
  selectedUserProfile: null, // For profile page
  isLoading: false,
  error: null,
  // searchResults: {} // Keep if search functionality is added later
};

// --- Slice Definition ---
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.error = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUserProfile = null;
    },
    // Add user manually if needed elsewhere
    // addOrUpdateUser: (state, action) => { ... }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Users (Admin)
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.usersList = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch User By ID (Profile)
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.selectedUserProfile = null; // Clear previous profile while loading
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUserProfile = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.selectedUserProfile = null;
      })

       // Update Avatar
      .addCase(updateUserAvatar.pending, (state) => {
        state.isLoading = true; // Or a specific loading flag like isAvatarLoading
        state.error = null;
      })
      .addCase(updateUserAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        const { avatar, userId } = action.payload;
        // Update profile if the updated user is the one being viewed
        if (state.selectedUserProfile?._id === userId) { // Check if it's the logged-in user's profile
             state.selectedUserProfile.avatar = avatar;
        }
        // Note: The authSlice is updated via dispatch in the thunk
      })
      .addCase(updateUserAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
       // Update Role (Admin)
      .addCase(updateUserRole.pending, (state) => {
        // Optional: set a specific loading state for role update
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        // Update the user in the admin list
        const index = state.usersList.findIndex(u => u._id === updatedUser._id);
        if (index !== -1) {
            state.usersList[index] = { ...state.usersList[index], role: updatedUser.role };
        }
        // Update selected profile if it matches
        if (state.selectedUserProfile?._id === updatedUser._id) {
            state.selectedUserProfile.role = updatedUser.role;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        // Optional: handle specific role update error
        state.error = action.payload;
      });
  }
});

// --- Export actions and reducer ---
export const { clearUsersError, clearSelectedUser } = usersSlice.actions;

// --- Selectors ---
export const selectAdminUserList = (state) => state.users.usersList;
export const selectUserProfile = (state) => state.users.selectedUserProfile;
export const selectIsUsersLoading = (state) => state.users.isLoading;
export const selectUsersError = (state) => state.users.error;
// Selector to get a specific user (useful for memoization if needed later)
export const selectUserById = (userId) => (state) => {
    if (state.selectedUserProfile?._id === userId) {
        return state.selectedUserProfile;
    }
    // Optionally check usersList if needed, though profile usually loads separately
    return state.users.usersList?.find(u => u._id === userId);
};


export default usersSlice.reducer;
// --- END OF FILE frontend/src/redux/slices/usersSlice.js ---