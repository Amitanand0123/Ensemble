import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
    tasks:[],
    currentTask: null,
    isLoading: false,
    error: null
}

const handleReject=(error)=>{
    const message=error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'An unknown error occurred'
    console.error("API Error:",error.response?.data || error)
    return message;
}

export const fetchTasks = createAsyncThunk(
    'tasks/fetchAll',
    async ({ projectId, filters }, { rejectWithValue, getState }) => {
        
        try {
            const token=getState().auth.token || localStorage.getItem('token');
            if(!token){
                return rejectWithValue('No auth token found')
            }
            if(!projectId){
                return rejectWithValue('Project ID is required')
            }
            console.log(`Fetching tasks for project ${projectId} with filters:`,filters)
            const response = await axios.get(`/api/tasks/project/${projectId}/tasks`, {
                params: filters,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return response.data.tasks || []
        } catch (error) {
            console.error(`Error fetching tasks for project ${projectId}:`,error)
            return rejectWithValue(handleReject(error))
        }
    }
) 

export const createTask = createAsyncThunk(
    'tasks/create',
    async ({ formData }, { rejectWithValue, getState }) => {
        try {
            const token=getState().auth.token || localStorage.getItem('token')
            if(!token) return rejectWithValue('No auth token found')
            console.log("Dispatching createTask with FormData");
            const response = await axios.post('/api/tasks',
                formData,
                {
                    headers:{
                        'Authorization':`Bearer ${token}`
                    }
                }
            )
            console.log("Create task response:",response.data)
            return response.data.task
        } catch (error) {
            console.error("Error creating task:",error)
            return rejectWithValue(handleReject(error))
        }
    }
)

export const bulkUpdateTasks = createAsyncThunk(
    'tasks/bulkUpdate',
    async ({ tasks }, { rejectWithValue }) => {
        try {
            const response = await axios.patch('/api/tasks/bulk-update', { tasks })
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
            if(!token){
                return rejectWithValue('No auth token found')
            }
            if(!taskId){
                return rejectWithValue('Task ID is required')
            }
            console.log(`Updating task ${taskId} with updates:`,updates)
            const response=await axios.patch(`/api/tasks/${taskId}`,
                updates,
                {
                    headers:{
                        'Authorization':`Bearer ${token}`,
                        'Content-Type':'application/json'
                    }
                }
            )
            console.log("Update task response:",response.data)
            return response.data.task;
        } catch (error) {
            console.error(`Error updating task ${taskId}:`,error)
            return rejectWithValue(handleReject(error))
        }
    }
)

export const addTaskAttachments=createAsyncThunk(
    'tasks/addAttachments',
    async({taskId,formData},{rejectWithValue,getState})=>{
        try {
            const token=getState().auth.token || localStorage.getItem('token');
            if(!token){
                return rejectWithValue('No auth token found')
            }
            if(!taskId){
                return rejectWithValue('Task ID is required')
            }
            console.log(`Adding attachments to task ${taskId}`)
            const response=await axios.post(`/api/tasks/${taskId}/attachments`,
                formData,
                {
                    headers:{
                        'Authorization':`Bearer ${token}`
                    }
                }
            )
            console.log("Add attachments response:",response.data)
            return response.data.task;
        } catch (error) {
            console.error(`Error adding attachments to task ${taskId}:`,error)
            return rejectWithValue(handleReject(error))
        }
    }
)

export const deleteTask = createAsyncThunk(
    'tasks/delete',
    async ({ taskId }, { rejectWithValue, getState }) => {
        try {
            const token=getState().auth.token || localStorage.getItem('token')
            if(!token){
                return rejectWithValue('No auth token found')
            }
            if(!taskId){
                return rejectWithValue('Task ID is required')
            }
            console.log(`Deleting task ${taskId}`)
            await axios.delete(`/api/tasks/${taskId}`,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            return taskId
        } catch (error) {
            console.error(`Error deleting task ${taskId}:`,error)
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
        },
        clearTaskError:(state)=>{
            state.error=null;
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
                if(!Array.isArray(state.tasks)){
                    state.tasks=[]
                }
                state.tasks.push(action.payload)
                state.isLoading=false
            })
            .addCase(createTask.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            .addCase(updateTask.pending, (state) => {
                state.error = null
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const updatedTask = action.payload
                if(!Array.isArray(state.tasks)){
                    state.tasks=[]
                }
                const index=state.tasks.findIndex(task=>task._id===updatedTask._id)
                if(index!==-1){
                    state.tasks[index]=updatedTask
                }
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.error = action.payload
            })
            .addCase(addTaskAttachments.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(addTaskAttachments.fulfilled, (state, action) => {
                const updatedTask = action.payload
                if(!Array.isArray(state.tasks)){
                    state.tasks=[]
                }
                const index=state.tasks.findIndex(task=>task._id===updatedTask._id)
                if(index!==-1){
                    state.tasks[index]=updatedTask
                }
                state.isLoading=false
            })
            .addCase(addTaskAttachments.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            .addCase(deleteTask.pending,(state)=>{
                state.error=null
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                const deletedTaskId=action.payload
                if(!Array.isArray(state.tasks)){
                    state.tasks=[]
                }
                state.tasks=state.tasks.filter(task=>task._id!==deletedTaskId)
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.error = action.payload
            })

    }
})

export const { setCurrentTask,clearTaskError } = taskSlice.actions
export default taskSlice.reducer