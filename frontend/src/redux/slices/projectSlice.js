import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'



const getToken = (getState) => getState().auth.token

export const fetchProjects=createAsyncThunk( 
    'projects/fetchAll',
    async (workspaceId,{getState,rejectWithValue})=>{
        try {
            const token=getToken(getState)
            const response=await axios.get(`/api/projects/workspace/${workspaceId}/projects`,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            return response.data.projects
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects')
        }
    }
)

export const createProject=createAsyncThunk(
    'projects/create',
    async (projectData,{getState,rejectWithValue})=>{
        try {
            const token=getToken(getState)
            const response=await axios.post('/api/projects',projectData,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            return response.data.project
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const fetchProjectDetail=createAsyncThunk(
    'projects/fetchDetail',
    async (projectId,{getState,rejectWithValue})=>{
        try {
            const token=getToken(getState)
            const response=await axios.get(`/api/projects/${projectId}`,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            return response.data.project
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch project details') 
        }
    }
)

export const inviteProjectMember=createAsyncThunk(
    'projects/inviteMember',
    async ({projectId,email,role},{getState,rejectWithValue})=>{
        try {
            const token=getToken(getState)
            const response=await axios.post(`/api/projects/${projectId}/members/invite`,{email,role},{
                headers:{'Authorization':`Bearer ${token}`}
            })
            return {projectId,message:response.data.message}
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to invite member to project')
        }
    }
)

export const updateProjectMemberRole=createAsyncThunk(
    'projects/updateMemberRole',
    async ({projectId,memberUserId,role},{getState,rejectWithValue})=>{
        try {
            const token=getToken(getState)
            await axios.patch(`/api/projects/${projectId}/members/${memberUserId}/role`,{role},{
                headers:{'Authorization':`Bearer ${token}`}
            })
            return {projectId,memberUserId,role}
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update project member role')
        }
    }
)

export const removeProjectMember=createAsyncThunk(
    'projects/removeMember',
    async ({projectId,memberUserId},{getState,rejectWithValue})=>{
        try {
            const token=getToken(getState)
            await axios.delete(`/api/projects/${projectId}/members/${memberUserId}`,{
                headers:{'Authorization':`Bearer ${token}`}
            })
            return {projectId,memberUserId}
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove member from project')
        }
    }
)

export const updateProjectSettings=createAsyncThunk(
    'projects/updateSettings',
    async ({projectId,settings},{getState,rejectWithValue})=>{
        try {
            const token=getToken(getState)
            const response=await axios.patch(`/api/projects/${projectId}`,settings,{
                headers:{'Authorization':`Bearer ${token}`}
            })
            return response.data.project
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update project settings')
        }
    }
)

const initialState={
    projects:[],
    currentProject:null,
    // projectDetail:null,
    isLoading:false,
    error:null
}

const projectSlice=createSlice({
    name:'projects',
    initialState,
    reducers:{
        setCurrentProject:(state,action)=>{
            state.currentProject=action.payload
        },
        clearProjectError:(state)=>{
            state.error=null
        },
        clearProjects:(state)=>{
            state.projects=[];
            state.currentProject=null;
            state.error=null
        }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(fetchProjects.pending,(state)=>{
                state.isLoading=true
                state.error=null
            })
            .addCase(fetchProjects.fulfilled,(state,action)=>{
                state.projects=action.payload
                state.isLoading=false
            })
            .addCase(fetchProjects.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
                state.projects=[]
            })
            .addCase(createProject.pending,(state)=>{
                state.isLoading=true
                state.error=null
            })
            .addCase(createProject.fulfilled,(state,action)=>{
                state.isLoading=false
                state.projects.push(action.payload)
            })
            .addCase(createProject.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
            })
            .addCase(fetchProjectDetail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProjectDetail.fulfilled, (state, action) => {
                state.currentProject = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchProjectDetail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentProject = null;
            })
            .addCase(updateProjectSettings.fulfilled,(state,action)=>{
                state.isLoading=false
                state.currentProject=action.payload
                const index=state.projects.findIndex(p=>p._id===action.payload._id)
                if(index!==-1){
                    state.projects[index]=action.payload
                }
            })
            .addCase(updateProjectSettings.rejected,(state,action)=>{
                state.isLoading=false
                state.error=action.payload
            })
            .addCase(inviteProjectMember.fulfilled,(state,action)=>{
                console.log('Project invite success:',action.payload.message)
            })
            .addCase(inviteProjectMember.rejected,(state,action)=>{
                state.error=action.payload
            })
            .addCase(updateProjectMemberRole.fulfilled,(state,action)=>{
                if(state.currentProject._id===action.payload.projectId){
                    const memberIndex=state.currentProject.members.findIndex(m=>m._id===action.payload.memberUserId)
                    if(memberIndex!==-1){
                        state.currentProject.members[memberIndex].role=action.payload.role
                    }
                }
            })
            .addCase(updateProjectMemberRole.rejected,(state,action)=>{
                state.error=action.payload
            })
            .addCase(removeProjectMember.fulfilled,(state,action)=>{
                if(state.currentProject._id===action.payload.projectId){
                    state.currentProject.members=state.currentProject.members.filter(m=>m._id!==action.payload.memberUserId)
                }
            })
            .addCase(removeProjectMember.rejected,(state,action)=>{
                state.error=action.payload
            })
        }
})

export const {setCurrentProject,clearProjectError,clearProjects}=projectSlice.actions
export default projectSlice.reducer