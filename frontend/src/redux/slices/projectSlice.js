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
    async (workspaceId,{rejectWithValue})=>{
        try {
            const response=await axios.get(`/api/projects?workspace=${workspaceId}`)
            return response.data.projects
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const createProject=createAsyncThunk(
    'projects/create',
    async (projectData,{rejectWithValue})=>{
        try {
            const response=await axios.post('/api/projects',projectData)
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
        }
})

export const {setCurrentProject,clearProjects}=projectSlice.actions
export default projectSlice.reducer