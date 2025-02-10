import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'
import { setCurrentWorkspace } from './workspaceSlice'

const initialState={
    projects:[],
    currentProject:null,
    isLoading:false,
    error:null
}

export const fetchProjects=createAsyncThunk(
    'projects/fetchAll',
    async (workspaceId,{rejectWithValue,getState})=>{
        try {
            const token=getState().auth.token || localStorage.getItem('token')
            const response=await axios.get(`http://localhost:5000/api/projects/workspace/${workspaceId}/projects`,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            return response.data.projects
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const createProject=createAsyncThunk(
    'projects/create',
    async (projectData,{rejectWithValue,getState})=>{
        try {
            const token=getState().auth.token || localStorage.getItem('token')
            const response=await axios.post('http://localhost:5000/api/projects',projectData,{
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
    async (projectId,{rejectWithValue,getState})=>{
        try {
            const token=getState().auth.token || localStorage.getItem('token')
            const response=await axios.get(`http://localhost:5000/api/projects/${projectId}`,{
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

const projectSlice=createSlice({
    name:'projects',
    initialState,
    reducers:{
        setCurrentProject:(state,action)=>{
            state.currentProject=action.payload
        },
        clearProjects:(state)=>{
            state.projects=[];
            state.currentProject=null;
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
            })
            .addCase(createProject.pending,(state)=>{
                state.isLoading=true
                state.error=null
            })
            .addCase(createProject.fulfilled,(state,action)=>{
                state.projects.push(action.payload)
                state.currentProject=action.payload
                state.isLoading=false
                state.error=null
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
            });
        }
})

export const {setCurrentProject,clearProjects}=projectSlice.actions
export default projectSlice.reducer