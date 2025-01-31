import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'
import { setCurrentWorkspace } from './workspaceSlice'

const initialState={
    projects:[],
    currentProject:null,
    isLoading:false,
    error:null
}

export const fetchprojects=createAsyncThunk(
    'projects/fetchAll',
    async (workspaceId,{rejectWithValue})=>{
        try {
            const reponse=await axios.get(`/api/projects?workspace=${workspaceId}`)
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
        }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(fetchprojects.fulfilled,(state,action)=>{
                state.projects=action.payload
                state.isLoading=false
            })
            .addCase(createProject.fulfilled,(state,action)=>{
                state.projects.push(action.payload)
                state.currentProject=action.payload
            })

        }
})

export const {setCurrentProject}=projectSlice.actions
export default projectSlice.reducer