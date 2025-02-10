import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'

const initialState={
    workspaces:[],
    currentWorkspace:null,
    workspaceDetail:null,
    isLoading:false,
    error:null
}

export const fetchWorkspaces=createAsyncThunk(
    'workspaces/fetchAll',
    async (_,{getState,rejectWithValue})=>{
        try {
            const token = getState().auth.token || localStorage.getItem('token');
            const response=await axios.get('http://localhost:5000/api/workspaces',{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            return response.data.workspaces
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const createWorkspace = createAsyncThunk(
    'workspaces/create',
    async (workspaceData, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token || localStorage.getItem('token');
            if (!token) {
                return rejectWithValue({ message: 'No authentication token found' });
            }
            console.log('Token from state:', token);

            // Set default Authorization header for all axios requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const response = await axios.post(
                'http://localhost:5000/api/workspaces', 
                workspaceData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return response.data.workspace;
        } catch (error) {
            console.error('Workspace Creation Error:', error.response?.data);
            return rejectWithValue(error.response?.data || { message: 'Unknown error' });
        }
    }
);

export const fetchWorkspaceDetail=createAsyncThunk(
    'workspaces/fetchDetail',
    async(workspaceId,{getState,rejectWithValue})=>{
        try {
            const token=getState().auth.token || localStorage.getItem('token')
            const response=await axios.get(`http://localhost:5000/api/workspaces/${workspaceId}`,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            return response.data.workspace
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const deleteWorkspace=createAsyncThunk(
    'workspaces/delete',
    async(workspaceId,{getState,rejectWithValue})=>{
        try {
            const token=getState().auth.token || localStorage.getItem('token');
            const response=await axios.delete(`http://localhost:5000/api/workspaces/${workspaceId}`,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            return {success:true,workspaceId}
        } catch (error) {
            return rejectWithValue(error.response?.data || {message:'Failed to delete workspace'})
        }
    }
)


const workspaceSlice=createSlice({
    name:'workspaces',
    initialState,
    reducers:{
        setCurrentWorkspace:(state,action)=>{
            state.currentWorkspace=action.payload
        }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(fetchWorkspaces.pending, (state) => { 
                state.isLoading = true; 
            })
            .addCase(fetchWorkspaces.fulfilled,(state,action)=>{
                state.workspaces=action.payload
                state.isLoading=false
            })
            .addCase(createWorkspace.fulfilled,(state,action)=>{
                state.workspaces.push(action.payload)
                state.currentWorkspace=action.payload
            })
            .addCase(fetchWorkspaceDetail.pending,(state)=>{
                state.isLoading=true
                state.error=null
            })
            .addCase(fetchWorkspaceDetail.fulfilled,(state,action)=>{
                state.workspaceDetail=action.payload
                state.isLoading=false
            })
            .addCase(fetchWorkspaceDetail.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
            })
            .addCase(deleteWorkspace.pending,(state)=>{
                state.isLoading=true
                state.error=null
            })
            .addCase(deleteWorkspace.fulfilled,(state,action)=>{
                state.isLoading=false
                state.workspaceDetail=null
                state.workspaces=state.workspaces.filter(workspace=>workspace._id!== action.payload.workspaceId)
            })
            .addCase(deleteWorkspace.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
            })
    }
})

export const {setCurrentWorkspace}=workspaceSlice.actions
export default workspaceSlice.reducer
export const selectWorkspaces=(state)=>state.workspaces.workspaces