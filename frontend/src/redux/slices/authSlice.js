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
            localStorage.setItem('token',response.data.accessToken)
            localStorage.setItem('user',JSON.stringify(response.data.user))
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`
            return response.data
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

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { getState }) => {
        try {
            const token = getState().auth.token;
            const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
            await axios.post('/api/auth/logout', {}, config);
        } catch (error) {
            console.warn("Backend logout call failed (might be expected):", error.response?.data || error.message);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
        }
        return {};
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

export const verifyEmailWithCode = createAsyncThunk(
    'auth/verifyEmailWithCode',
    async ({ email, code }, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/auth/verify-email', { email, code });
            return response.data;
        } catch (error) {
            return rejectWithValue(handleAuthError(error));
        }
    }
);

export const resendVerificationCode = createAsyncThunk(
    'auth/resendVerificationCode',
    async (email, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/auth/resend-verification', { email });
            return response.data;
        } catch (error) {
            return rejectWithValue(handleAuthError(error));
        }
    }
);



const authSlice=createSlice({
    name:'auth',
    initialState,
    reducers:{
        resetAuth:(state)=>{
            Object.assign(state, initialState);
            state.isAuthenticated = false;
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
        updateUser:(state,action)=>{
            if (state.user) {
                 state.user={...state.user,...action.payload};
                 localStorage.setItem('user',JSON.stringify(state.user));
                 state.isAdmin=state.user.role==='admin';
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
            state.token = action.payload.accessToken;
            state.isAdmin = action.payload.user.role === 'admin';
            state.message = 'Registration successful! Please check your email to verify.';
            state.error = null;
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.message = null;
        })
        .addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.message = null;
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.accessToken;
            state.isAdmin = action.payload.user.role === 'admin';
            state.message = 'Login successful';
            state.error = null;
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.message = null;
        })
         .addCase(logoutUser.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(logoutUser.fulfilled, (state) => {
             state.user = null;
             state.token = null;
             state.isAuthenticated = false;
             state.isLoading = false;
             state.error = null;
             state.message = 'Logged out successfully';
             state.isAdmin = false;
        })
        .addCase(logoutUser.rejected, (state, action) => {
            console.error("Logout rejected but resetting state:", action.payload);
             state.user = null;
             state.token = null;
             state.isAuthenticated = false;
             state.isLoading = false;
             state.error = action.payload || 'Logout failed';
             state.message = null;
             state.isAdmin = false;
        })
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
        .addCase(resetPassword.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.message = null;
        })
        .addCase(resetPassword.fulfilled, (state, action) => {
            state.isLoading = false;
            state.message = action.payload.message || 'Password reset successfully.';
            state.error = null;
        })
        .addCase(resetPassword.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.message = null;
        })
        .addCase(verifyEmail.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.message = null;
        })
        .addCase(verifyEmail.fulfilled, (state, action) => {
            state.isLoading = false;
            state.message = action.payload.message || 'Email verified successfully.';
            state.error = null;
            if (state.user && state.user.email_verification) {
                 state.user.email_verification.verified = true;
                 localStorage.setItem('user', JSON.stringify(state.user));
            }
        })
        .addCase(verifyEmail.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.message = null;
        })
        .addCase(verifyEmailWithCode.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.message = null;
        })
        .addCase(verifyEmailWithCode.fulfilled, (state, action) => {
            state.isLoading = false;
            state.message = action.payload.message;
            // If the verified user is the one in the state, update their status
            if (state.user?.email === action.meta.arg.email) {
                state.user.isVerified = true;
                // Also update localStorage if you store user object there
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser) {
                    storedUser.isVerified = true;
                    localStorage.setItem('user', JSON.stringify(storedUser));
                }
            }
        })
        .addCase(verifyEmailWithCode.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        .addCase(resendVerificationCode.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            // Keep the previous message until a new one arrives
        })
        .addCase(resendVerificationCode.fulfilled, (state, action) => {
            state.isLoading = false;
            state.message = action.payload.message; // Update message from backend
        })
        .addCase(resendVerificationCode.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload; // Set new error
        });
    }
})

export const { clearError, clearMessage, updateUser, resetAuth } = authSlice.actions;
export default authSlice.reducer;