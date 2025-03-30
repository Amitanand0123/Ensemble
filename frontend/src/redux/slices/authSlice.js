import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'

// const initialState={
//     user:localStorage.getItem('user')
//         ?JSON.parse(localStorage.getItem('user'))
//         :null,
//     token:localStorage.getItem('token') || null,
//     isAuthenticated:!!localStorage.getItem('token'),
//     isLoading:false,
//     error:null
// }

const handleAuthError=(error)=>{
    const message=error.response?.data?.message || error.message || 'Authentication failed'
    return message
} 

export const registerUser=createAsyncThunk(
    'auth/register',
    async (userData,{rejectWithValue})=>{
        try {
            const response=await axios.post('http://localhost:5000/api/auth/register',userData)
            localStorage.setItem('token',response.data.token)
            localStorage.setItem('user',JSON.stringify(response.data.user))
            return response.data // This will be `action.payload` in `.fulfilled`
        } catch (error) {
            const errorMessage = error.response?.data?.errors 
                ? error.response.data.errors[0].msg
                : error.response?.data?.message || 'Registration failed';
            return rejectWithValue(errorMessage)
        }
    } 
)

export const loginUser=createAsyncThunk(
    'auth/login',
    async (credentials,{rejectWithValue})=>{ 
        try {
            const response=await axios.post('http://localhost:5000/api/auth/login',credentials);
            localStorage.setItem('token',response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed')
        }
    }
)

// export const logoutUser=createAsyncThunk(
//     'auth/logout',
//     async()=>{
//         localStorage.removeItem('token')
//         localStorage.removeItem('user')
//         return null
//     }
// )

export const logoutUser=createAsyncThunk(
    'auth/logout',
    async(_,{getState,rejectWithValue})=>{
        try {
            const {auth}=getState()
            const token=auth.token
            console.log("Token from state before logout: ",token)
            let config={
                withCredentials:true
            }
            if(token){
                config.headers={
                    'Authorization':`Bearer ${token}`
                }
            }
            else{
                console.warn("Attempting to logout without a token")
            }
            await axios.post('http://localhost:5000/api/auth/logout',{},config)
            delete axios.defaults.headers.common['Authorization']
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            return {};
        } catch (error) {
            console.error("Logout API call failed:",error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || handleAuthError(error))
        }
    }
)

export const forgotPassword=createAsyncThunk(
    'auth/forgot-password',
    async({email},{rejectWithValue})=>{
        try {
            const response=await axios.post('http://localhost:5000/api/auth/forgot-password',{email})
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
            const response=await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`,{password})
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
            const response=await axios.get(`http://localhost:5000/api/auth/verify-email/${token}`)
            return response.data
        } catch (error) {
            return rejectWithValue(handleAuthError(error))
        }
    }
)

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

const authSlice=createSlice({
    name:'auth',
    initialState,
    reducers:{
        resetAuth:(state)=>{
            state.isAuthenticated=false,
            state.user=null,
            state.isAdmin=false,
            localStorage.removeItem('token'),
            localStorage.removeItem('user')
        },
        clearError:(state)=>{
            state.error=null;
        },
        clearMessage:(state)=>{
            state.message=null
        },
        updateUser:(state,action)=>{
            state.user={...state.user,...action.payload}
            localStorage.setItem('user',JSON.stringify(state.user))
        }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(registerUser.pending,(state)=>{
                state.isLoading=true
                state.error=null
            })
            .addCase(registerUser.fulfilled,(state,action)=>{
                state.isLoading=false
                state.isAuthenticated=true
                state.user=action.payload.user
                state.isAdmin=action.payload.user.role==='admin'
                state.token=action.payload.token
                state.message='Registration successful! Please verify your email'
            })
            .addCase(registerUser.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
            })
            .addCase(loginUser.pending,(state)=>{
                state.isLoading=true
                state.error=null
            })
            .addCase(loginUser.fulfilled,(state,action)=>{
                state.isLoading=false
                state.isAuthenticated=true
                state.user=action.payload.user;
                state.isAdmin=action.payload.user.role==='admin';
                console.log("Login Payload received :", JSON.stringify(action.payload,null,2)); // Keep for debugging (optional)
                console.log("Specific access token:", action.payload.accessToken); // Log accessToken now
            
                const receivedToken = action.payload.accessToken; // <--- Corrected: Use 'accessToken'
                if(typeof receivedToken!=='string' || !receivedToken.includes('.')){
                    console.error("Received token is not a valid JWT string:");
                }
                state.token=receivedToken;
                localStorage.setItem('token', receivedToken); // Update localStorage as well
                localStorage.setItem('user', JSON.stringify(action.payload.user));
                axios.defaults.headers.common['Authorization'] = `Bearer ${action.token}`; // Update axios defaults
                state.message='Login successful';
                state.error=null;
            })
            .addCase(loginUser.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
            })
            .addCase(logoutUser.fulfilled,(state)=>{
                state.isAuthenticated=false
                state.user=null
                state.token=null
                state.isAdmin=false
                state.isLoading=false
                state.message='Logged out successfully'
                state.error=null
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                delete axios.defaults.headers.common['Authorization']
            })
            .addCase(logoutUser.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
                console.error("Logout rejected in reducer: ", action.payload);
            })
            .addCase(forgotPassword.pending,(state)=>{
                state.isLoading=true
                state.error=null
                state.message=null
            })
            .addCase(forgotPassword.fulfilled,(state,action)=>{
                state.isLoading=false
                state.message='Password reset link has been sent to your email'
            })
            .addCase(forgotPassword.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
            })
            .addCase(resetPassword.pending,(state)=>{
                state.isLoading=true
                state.error=null
            })
            .addCase(resetPassword.fulfilled,(state,action)=>{
                state.isLoading=false
                state.message='Password has been reset successfully'
            })
            .addCase(resetPassword.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
            })
            .addCase(verifyEmail.pending,(state)=>{
                state.isLoading=true
                state.error=null
            })
            .addCase(verifyEmail.fulfilled,(state,action)=>{
                state.isLoading=false
                state.message='Email verified successfully'
                if(state.user){
                    state.user.email_verification={verified:true}
                }
            })
            .addCase(verifyEmail.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
            })
    }
})

export const { clearError,clearMessage,updateUser,resetAuth}=authSlice.actions
export default authSlice.reducer