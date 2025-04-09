// --- START OF FILE frontend/src/redux/slices/authSlice.js ---

import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'


const handleAuthError=(error)=>{
    const message=error.response?.data?.message || (Array.isArray(error.response?.data?.errors) && error.response.data.errors[0]?.msg) || error.message || 'Authentication failed'
    console.error("auth Error:",error.response?.data || error)
    return message
}


const initialState={
    user:localStorage.getItem('user')
        ?JSON.parse(localStorage.getItem('user'))
        :null,
    token:localStorage.getItem('token') || null,
    isAuthenticated:!!localStorage.getItem('token'),
    isLoading:false,
    error:null,
    message:null,
    isAdmin:localStorage.getItem('user') ?
            JSON.parse(localStorage.getItem('user')).role === 'admin' : false
}

export const registerUser=createAsyncThunk(
    'auth/register',
    async (userData,{rejectWithValue})=>{
        try {
            const response=await axios.post('/api/auth/register',userData)
            // localStorage.setItem('token',response.data.token)
            localStorage.setItem('token',response.data.accessToken)
            localStorage.setItem('user',JSON.stringify(response.data.user))
            axios .defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`
            return response.data // This will be `action.payload` in `.fulfilled`
        } catch (error) {
            return rejectWithValue(handleAuthError(error))
        }
    }
)

export const loginUser=createAsyncThunk(
    'auth/login',
    async (credentials,{rejectWithValue})=>{
        try {
            const response=await axios.post('/api/auth/login',credentials);
            localStorage.setItem('token',response.data.accessToken)
            localStorage.setItem('user', JSON.stringify(response.data.user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
            return response.data
        } catch (error) {
            return rejectWithValue(handleAuthError(error))
        }
    }
)

// Updated logoutUser Thunk
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
            // Attempt to call backend logout endpoint (optional but good practice)
            await axios.post('/api/auth/logout', {}, config);
        } catch (error) {
            // Log backend error but proceed with frontend cleanup
            console.warn("Backend logout call failed (might be expected):", error.response?.data || error.message);
        } finally {
            // --- Crucial Frontend Cleanup ---
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
        }
        // Always return success for frontend state reset, even if backend call failed
        return {}; // Indicate successful frontend cleanup
    }
);


export const forgotPassword=createAsyncThunk(
    'auth/forgot-password',
    async({email},{rejectWithValue})=>{
        try {
            const response=await axios.post('/api/auth/forgot-password',{email})
            return response.data
        } catch (error) {
            return rejectWithValue(handleAuthError(error))
        }
    }
)

export const resetPassword=createAsyncThunk(
    'auth/resetPassword',
    async({token,password},{rejectWithValue})=>{
        try {
            const response=await axios.post(`/api/auth/reset-password/${token}`,{password})
            return response.data
        } catch (error) {
            return rejectWithValue(handleAuthError(error))
        }
    }
)

export const verifyEmail=createAsyncThunk(
    'auth/verify-email',
    async(token,{rejectWithValue})=>{
        try {
            const response=await axios.get(`/api/auth/verify-email/${token}`)
            return response.data
        } catch (error) {
            return rejectWithValue(handleAuthError(error))
        }
    }
)



const authSlice=createSlice({
    name:'auth',
    initialState,
    reducers:{
        resetAuth:(state)=>{
            // Reset all state properties to their initial values
            Object.assign(state, initialState);
            state.isAuthenticated = false; // Explicitly set false
            state.token = null;
            state.user = null;
            state.isAdmin = false;
        },
        clearError:(state)=>{
            state.error=null;
        },
        clearMessage:(state)=>{
            state.message=null
        },
        // Reducer to handle partial user updates (like avatar)
        updateUser:(state,action)=>{
            if (state.user) { // Only update if user exists
                 state.user={...state.user,...action.payload};
                 localStorage.setItem('user',JSON.stringify(state.user)); // Sync localStorage
                 state.isAdmin=state.user.role==='admin'; // Re-check admin status
            }
        }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.message = null;
        })
        .addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.accessToken; // Correct key
            state.isAdmin = action.payload.user.role === 'admin';
            state.message = 'Registration successful! Please check your email to verify.';
            state.error = null;
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload; // Error message from rejectWithValue
            state.message = null;
        })

        // --- Login ---
        .addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.message = null;
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.accessToken; // Correct key
            state.isAdmin = action.payload.user.role === 'admin';
            state.message = 'Login successful';
            state.error = null;
            // Local storage and axios defaults are handled in the thunk now
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload; // Error message from rejectWithValue
            state.message = null;
        })

        // --- Logout ---
         .addCase(logoutUser.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(logoutUser.fulfilled, (state) => {
             // Use the resetAuth action for clean state reset
            // return { ...initialState, message: 'Logged out successfully', isLoading: false };
             // Or directly reset here
             state.user = null;
             state.token = null;
             state.isAuthenticated = false;
             state.isLoading = false;
             state.error = null;
             state.message = 'Logged out successfully';
             state.isAdmin = false;
        })
        .addCase(logoutUser.rejected, (state, action) => {
            // Even if backend fails, reset frontend state
            console.error("Logout rejected but resetting state:", action.payload);
             state.user = null;
             state.token = null;
             state.isAuthenticated = false;
             state.isLoading = false;
             state.error = action.payload || 'Logout failed'; // Keep error message
             state.message = null;
             state.isAdmin = false;
        })


        // --- Forgot Password ---
        .addCase(forgotPassword.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.message = null;
        })
        .addCase(forgotPassword.fulfilled, (state, action) => {
            state.isLoading = false;
            state.message = action.payload.message || 'Password reset link sent.';
            state.error = null;
        })
        .addCase(forgotPassword.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.message = null;
        })

        // --- Reset Password ---
        .addCase(resetPassword.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.message = null;
        })
        .addCase(resetPassword.fulfilled, (state, action) => {
            state.isLoading = false;
            state.message = action.payload.message || 'Password reset successfully.';
            state.error = null;
            // Optionally log in the user if token is returned
            if (action.payload.accessToken) {
                // state.isAuthenticated = true;
                // state.user = action.payload.user; // Assuming user is returned
                // state.token = action.payload.accessToken;
                // state.isAdmin = action.payload.user?.role === 'admin';
                // localStorage.setItem('token', action.payload.accessToken);
                // localStorage.setItem('user', JSON.stringify(action.payload.user));
                // axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.accessToken}`;
            }
        })
        .addCase(resetPassword.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.message = null;
        })

        // --- Verify Email ---
        .addCase(verifyEmail.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.message = null;
        })
        .addCase(verifyEmail.fulfilled, (state, action) => {
            state.isLoading = false;
            state.message = action.payload.message || 'Email verified successfully.';
            state.error = null;
            // Update user state if logged in user is the one being verified
            if (state.user && state.user.email_verification) {
                 state.user.email_verification.verified = true;
                 localStorage.setItem('user', JSON.stringify(state.user)); // Update local storage too
            }
        })
        .addCase(verifyEmail.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.message = null;
        });
    }
})

// Export the new updateUser action
export const { clearError,clearMessage,updateUser,resetAuth}=authSlice.actions
export default authSlice.reducer
// --- END OF FILE frontend/src/redux/slices/authSlice.js ---