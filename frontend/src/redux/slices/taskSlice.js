import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
    tasks:[],
    currentTask: null,
    isLoading: false,
    error: null
}

export const fetchTasks = createAsyncThunk(
    'tasks/fetchAll',
    async ({ projectId, filters }, { rejectWithValue, getState }) => {
        try {
            const token=getState().auth.token || localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/tasks/project/${projectId}/tasks`, {
                params: filters,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return response.data.tasks || []
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch tasks')
        }
    }
) 

export const createTask = createAsyncThunk(
    'tasks/create',
    async ({ taskData }, { rejectWithValue, getState }) => {
        try {
            const token=getState().auth.token || localStorage.getItem('token')
            console.log("Token from state:", token);
            const response = await axios.post('http://localhost:5000/api/tasks',
                taskData,
                {
                    headers:{
                        'Authorization':`Bearer ${token}`
                    }
                }
            )
            return response.data.task
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create task')
        }
    }
)

export const bulkUpdateTasks = createAsyncThunk(
    'tasks/bulkUpdate',
    async ({ tasks }, { rejectWithValue }) => {
        try {
            const response = await axios.patch('http://localhost:5000/api/tasks/bulk-update', { tasks })
            return response.data.tasks
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update tasks')
        }
    }
)

export const updateTask = createAsyncThunk(
    'tasks/update',
    async ({taskId,updates},{rejectWithValue,getState})=>{
        try {
            const token=getState().auth.token || localStorage.getItem('token')
            const response=await axios.patch(`http://localhost:5000/api/tasks/${taskId}`,
                updates,
                {
                    headers:{
                        'Authorization':`Bearer ${token}`
                    }
                }
            )
            return response.data.task;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update task')
        }
    }
)

export const deleteTask = createAsyncThunk(
    'tasks/delete',
    async ({ taskId }, { rejectWithValue, getState }) => {
        try {
            const token=getState().auth.token || localStorage.getItem('token')
            await axios.delete(`http://localhost:5000/api/tasks/${taskId}`,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            return taskId
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete task')
        }
    }
)

const taskSlice = createSlice({
    name: 'task',
    initialState,
    reducers: {
        setCurrentTask: (state, action) => {
            state.currentTask = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.tasks = action.payload || []
                state.isLoading = false
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
                state.tasks = []
            })
            .addCase(createTask.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.tasks.push(action.payload)
                state.isLoading=false
                state.error=null
            })
            .addCase(createTask.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            .addCase(updateTask.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const updatedTask = action.payload
                state.tasks=state.tasks.map(task=>
                    task._id===updatedTask._id?updatedTask:task
                )
                state.isLoading=false
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            .addCase(deleteTask.pending,(state)=>{
                state.isLoading=true
                state.error=null
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.tasks=state.tasks.filter(task=>task._id!==action.payload)
                state.isLoading=false
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

    }
})

export const { setCurrentTask } = taskSlice.actions
export default taskSlice.reducer