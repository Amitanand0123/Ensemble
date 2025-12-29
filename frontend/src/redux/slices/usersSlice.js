import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { updateUser } from './authSlice.js';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'An error occurred';
  console.error("User Slice Error:", error.response?.data || error);
  return message;
};

export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.users || [];
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (userId, { getState, rejectWithValue }) => {
    const state = getState();
    const loggedInUserId = state.auth.user?.id;
    const actualUserId = userId.toLowerCase() === 'me' ? loggedInUserId : userId;

    if (!actualUserId) {
      return rejectWithValue('User ID could not be determined.');
    }

    try {
      const token = state.auth.token;
      if (!token) {
        return rejectWithValue('Authentication token not found.');
      }
      const response = await axios.get(`/api/users/${actualUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const updateUserAvatar = createAsyncThunk(
  'users/updateAvatar',
  async (formData, { getState, rejectWithValue, dispatch }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?.id;
      if (!userId) {
          return rejectWithValue('User not logged in for avatar update.');
      }

      const response = await axios.patch('/api/users/me/avatar', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      dispatch(updateUser({ avatar: response.data.avatar }));
      return { userId, avatar: response.data.avatar };
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

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
            return response.data.user;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const initialState = {
  usersList: [],
  selectedUserProfile: null,
  isLoading: false,
  error: null,
};

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
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
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
      .addCase(updateUserAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        const { avatar, userId } = action.payload;
        if (state.selectedUserProfile?._id === userId) {
             state.selectedUserProfile.avatar = avatar;
        }
      })
      .addCase(updateUserAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateUserRole.pending, (state) => {
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.usersList.findIndex(u => u._id === updatedUser._id);
        if (index !== -1) {
            state.usersList[index] = { ...state.usersList[index], role: updatedUser.role };
        }
        if (state.selectedUserProfile?._id === updatedUser._id) {
            state.selectedUserProfile.role = updatedUser.role;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearUsersError, clearSelectedUser } = usersSlice.actions;

export const selectAdminUserList = (state) => state.users.usersList;
export const selectUserProfile = (state) => state.users.selectedUserProfile;
export const selectIsUsersLoading = (state) => state.users.isLoading;
export const selectUsersError = (state) => state.users.error;
export const selectUserById = (userId) => (state) => {
    if (state.selectedUserProfile?._id === userId) {
        return state.selectedUserProfile;
    }
    return state.users.usersList?.find(u => u._id === userId);
};

export default usersSlice.reducer;