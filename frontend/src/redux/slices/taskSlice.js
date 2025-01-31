import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState={
    tasks:[],
    currentTask:null,
    isLoading:false,
    error:null
}

export const fetchTasks=createAsyncThunk(
    'tasks/fetchAll',
    async(filters,{rejectWithValue})=>{
        try {
            const response=await axios.get('/api/tasks',{params:filters})
            return response.data.tasks
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const createTask=createAsyncThunk(
    'tasks/create',
    async (taskData,{rejectWithValue})=>{
        try {
            const reponse=await axios.post('/api/tasks',taskData)
            return response.data.task
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

const taskSlice=createSlice({
    name:'task',
    initialState,
    reducers:{
        setCurrentTask:(state,action)=>{
            state.currentTask=action.payload
        }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(fetchTasks.fulfilled,(state,action)=>{
                state.tasks=action.payload
                state.isLoading=false
            })
            .addCase(createTask.fulfilled,(state,action)=>{
                state.tasks.push(action.payload)
            })
    }
})

export const {setCurrentTask}=taskSlice.actions
export default taskSlice.reducer