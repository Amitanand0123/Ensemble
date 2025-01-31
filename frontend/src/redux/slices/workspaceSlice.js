import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'

const initialState={
    workspace:[],
    currentWorkspace:null,
    isLoading:false,
    error:null
}

export const fetchWorkspaces=createAsyncThunk(
    'workspaces/fetchAll',
    async (_,{rejectWithValue})=>{
        try {
            const response=await axios.get('/api/workspaces')
            return response.data.workspaces
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const createWorkspace=createAsyncThunk(
    'workspaces/create',
    async (workspaceData,{rejectWithValue})=>{
        try {
            const response=await axios.post('/api/workspaces',workspaceData)
            return response.data.workspace
        } catch (error) {
            return rejectWithValue(error.response.data)
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
            .addCase(fetchWorkspaces.fulfilled,(state,action)=>{
                state.workspaces=action.payload
                state.isLoading=false
            })
            .addCase(createWorkspace.fulfilled,(state,action)=>{
                state.workspaces.push(action.payload)
                state.currentWorkspace=action.payload
            })
    }
})

export const {setCurrentWorkspace}=workspaceSlice.actions
export default workspaceSlice.reducer