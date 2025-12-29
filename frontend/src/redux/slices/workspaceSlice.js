import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'

const initialState={
    workspaces:[],
    workspaceDetail:null,
    isLoading:false, 
    error:null
} 

const getToken = (getState) => {
    return getState().auth.token || localStorage.getItem('token');
};

export const fetchWorkspaces=createAsyncThunk(
    'workspaces/fetchAll',
    async (_,{getState,rejectWithValue})=>{
        try {
            const token = getToken(getState);
            const response=await axios.get('/api/workspaces',{
                headers:{ 'Authorization':`Bearer ${token}` }
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
            const token = getToken(getState);
            if (!token) {
                return rejectWithValue({ message: 'No authentication token found' });
            }
            const response = await axios.post('/api/workspaces', workspaceData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.workspace;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Unknown error' });
        }
    }
);

export const fetchWorkspaceDetail=createAsyncThunk(
    'workspaces/fetchDetail',
    async(workspaceId,{getState,rejectWithValue})=>{
        try {
            const token=getToken(getState)
            const response=await axios.get(`/api/workspaces/${workspaceId}`,{
                headers:{ 'Authorization':`Bearer ${token}` }
            })
            return response.data.workspace
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const joinWorkspace=createAsyncThunk(
    'workspaces/join',
    async (inviteCode,{getState,rejectWithValue})=>{
        try {
            const token=getToken(getState);
            const response=await axios.post('/api/workspaces/join', {inviteCode}, {
                headers:{'Authorization':`Bearer ${token}`}
            })
            return response.data.workspace;
        } catch (error) {
            return rejectWithValue(error.response?.data || {message:'Failed to join workspace'})
        }
    }
)

export const deleteWorkspace=createAsyncThunk(
    'workspaces/delete',
    async(workspaceId,{getState,rejectWithValue})=>{
        try {
            const token=getToken(getState);
            await axios.delete(`/api/workspaces/${workspaceId}`,{
                headers:{ 'Authorization':`Bearer ${token}` }
            })
            return workspaceId;
        } catch (error) {
            return rejectWithValue(error.response?.data || {message:'Failed to delete workspace'})
        }
    }
)

export const updateWorkspaceSettings=createAsyncThunk(
    'workspaces/updateSettings',
    async({workspaceId,settings},{getState,rejectWithValue})=>{
        try {
            const token=getToken(getState)
            const response=await axios.patch(`/api/workspaces/${workspaceId}`,settings,{
                headers:{'Authorization':`Bearer ${token}`}
            })
            return response.data.workspace;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update settings')
        }
    }
)

export const inviteWorkspaceMember=createAsyncThunk(
    'workspaces/inviteMember',
    async({workspaceId,email,role},{getState,rejectWithValue})=>{
        try {
            const token=getToken(getState)
            const response=await axios.post(`/api/workspaces/${workspaceId}/members/invite`,{email,role},{
                headers:{'Authorization':`Bearer ${token}`}
            })
            return response.data.workspace;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to invite member')
        }
    }
)

export const updateWorkspaceMemberRole=createAsyncThunk(
    'workspaces/updateMemberRole',
    async({workspaceId,memberUserId,role},{getState,rejectWithValue})=>{
        try {
            const token=getToken(getState)
            await axios.patch(`/api/workspaces/${workspaceId}/members/${memberUserId}/role`,{role},{
                headers:{'Authorization':`Bearer ${token}`}
            })
            return {workspaceId, memberUserId, role};
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update member role')
        }
    }
)

export const removeWorkspaceMember=createAsyncThunk(
    'workspaces/removeMember',
    async({workspaceId,memberUserId},{getState,rejectWithValue})=>{
        try {
            const token=getToken(getState)
            await axios.delete(`/api/workspaces/${workspaceId}/members/${memberUserId}`,{
                headers:{'Authorization':`Bearer ${token}`}
            })
            return {workspaceId,memberUserId}
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove member')
        }
    }
)


const workspaceSlice=createSlice({
    name:'workspaces',
    initialState,
    reducers:{
        setCurrentWorkspace:(state,action)=>{
            state.workspaceDetail=action.payload
        },
        clearWorkspaceError:(state)=>{
            state.error=null
        }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(fetchWorkspaces.pending, (state) => { 
                state.isLoading = true; 
                state.error = null;
            })
            .addCase(fetchWorkspaces.fulfilled,(state,action)=>{
                state.workspaces=action.payload
                state.isLoading=false
            })
            .addCase(fetchWorkspaces.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
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
                state.workspaceDetail=null
            })
            .addCase(createWorkspace.pending,(state)=>{
                state.isLoading=true
                state.error=null
            })
            .addCase(createWorkspace.fulfilled,(state,action)=>{
                state.workspaces.push(action.payload)
                state.isLoading=false
            })
            .addCase(createWorkspace.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
            })
            .addCase(deleteWorkspace.pending,(state)=>{
                state.isLoading=true
                state.error=null
            })
            .addCase(deleteWorkspace.fulfilled,(state,action)=>{
                state.isLoading=false
                state.workspaces=state.workspaces.filter(ws=>ws._id!== action.payload)
                if(state.workspaceDetail?._id===action.payload){
                    state.workspaceDetail=null
                }
            })
            .addCase(deleteWorkspace.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
            })
            .addCase(joinWorkspace.pending,(state)=>{
                state.isLoading=true
                state.error=null
            })
            .addCase(joinWorkspace.fulfilled,(state,action)=>{
                state.isLoading=false
                if(!state.workspaces.some(ws=>ws._id===action.payload._id)){
                    state.workspaces.push(action.payload)
                }
            })
            .addCase(joinWorkspace.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
            })
            .addCase(updateWorkspaceSettings.fulfilled,(state,action)=>{
                state.isLoading=false
                state.workspaceDetail=action.payload
                const index=state.workspaces.findIndex(ws=>ws._id===action.payload._id)
                if(index!==-1){
                    state.workspaces[index]=action.payload
                }
            })
            .addCase(updateWorkspaceSettings.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
            })
            .addCase(inviteWorkspaceMember.fulfilled,(state,action)=>{
                state.workspaceDetail = action.payload;
            })
            .addCase(inviteWorkspaceMember.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
            })
            .addCase(updateWorkspaceMemberRole.fulfilled,(state,action)=>{
                if(state.workspaceDetail?._id===action.payload.workspaceId){
                    const memberIndex=state.workspaceDetail.members.findIndex(m=> (m.user._id || m.user) === action.payload.memberUserId)
                    if(memberIndex!==-1){
                        state.workspaceDetail.members[memberIndex].role=action.payload.role
                    }
                }
            })
            .addCase(updateWorkspaceMemberRole.rejected,(state,action)=>{
                state.error=action.payload
            })
            .addCase(removeWorkspaceMember.fulfilled,(state,action)=>{
                if(state.workspaceDetail?._id===action.payload.workspaceId){
                    state.workspaceDetail.members=state.workspaceDetail.members.filter(m=>(m.user._id || m.user)!==action.payload.memberUserId)
                }
            })
            .addCase(removeWorkspaceMember.rejected,(state,action)=>{
                state.error=action.payload
            })

    }
})

export const {setCurrentWorkspace,clearWorkspaceError}=workspaceSlice.actions
export default workspaceSlice.reducer