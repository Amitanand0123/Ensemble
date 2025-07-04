
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    files: [], 
    isLoading: false,
    error: null,
    summaries:{}
};


const handleReject = (error) => {
    const message = error.response?.data?.message || error.message || 'An unknown file operation error occurred';
    console.error("File Slice Error:", error.response?.data || error);
    return message;
};


export const fetchWorkspaceFiles = createAsyncThunk(
    'files/fetchWorkspace',
    async (workspaceId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.get(`/api/workspaces/${workspaceId}/files`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.files || [];
        } catch (error) {
            return rejectWithValue(handleReject(error));
        }
    }
);


export const fetchProjectFiles = createAsyncThunk(
    'files/fetchProject',
    async (projectId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.get(`/api/projects/${projectId}/files`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.files || [];
        } catch (error) {
            return rejectWithValue(handleReject(error));
        }
    }
);

export const uploadWorkspaceFiles = createAsyncThunk(
    'files/uploadWorkspace',
    async ({ workspaceId, formData }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.post(`/api/workspaces/${workspaceId}/files`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.files; 
        } catch (error) {
            return rejectWithValue(handleReject(error));
        }
    }
);


export const uploadProjectFiles = createAsyncThunk(
    'files/uploadProject',
    async ({ projectId, formData }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.post(`/api/projects/${projectId}/files`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.files;
        } catch (error) {
            return rejectWithValue(handleReject(error));
        }
    }
);



export const deleteFile = createAsyncThunk(
    'files/delete',
    async (fileId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            await axios.delete(`/api/files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return fileId; 
        } catch (error) {
            return rejectWithValue(handleReject(error));
        }
    }
);

export const getFileSummary=createAsyncThunk(
    'files/summary',
    async (fileId,{getState,rejectWithValue})=>{
        try {
            const token=getState().auth.token
            const response=await axios.get(`/api/files/${fileId}/summary`,{
                headers:{'Authorization':`Bearer ${token}`}
            })
            return response.data
        } catch (error) {
            return rejectWithValue({fileId,message:handleReject(error)})
        }
    }
)

const fileSlice = createSlice({
    name: 'files',
    initialState,
    reducers: {
        clearFiles: (state) => {
            state.files = [];
            state.error = null;
            state.summaries={}
        },
        clearFileError: (state) => {
            state.error = null;
        },
        clearSummary:(state,action)=>{
            const fileId=action.payload
            if(state.summaries[fileId]){
                delete state.summaries[fileId]
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkspaceFiles.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(fetchProjectFiles.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(fetchWorkspaceFiles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.files = action.payload;
            })
             .addCase(fetchProjectFiles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.files = action.payload;
            })
            .addCase(fetchWorkspaceFiles.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; state.files = []; })
            .addCase(fetchProjectFiles.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; state.files = []; })
            .addCase(uploadWorkspaceFiles.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(uploadProjectFiles.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(uploadWorkspaceFiles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.files.unshift(...action.payload); 
            })
             .addCase(uploadProjectFiles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.files.unshift(...action.payload);
            })
            .addCase(uploadWorkspaceFiles.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
            .addCase(uploadProjectFiles.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
            .addCase(deleteFile.pending, (state) => {
                state.error = null; 
            })
            .addCase(deleteFile.fulfilled, (state, action) => {
                state.files = state.files.filter((file) => file._id !== action.payload);
            })
            .addCase(deleteFile.rejected, (state, action) => {
                state.error = action.payload; 
            })
            .addCase(getFileSummary.pending,(state,action)=>{
                const fileId=action.meta.arg;
                state.summaries[fileId]={isLoading:true,error:null,summary:null}
            })
            .addCase(getFileSummary.fulfilled,(state,action)=>{
                const {fileId,summary}=action.payload;
                state.summaries[fileId]={isLoading:false,error:null,summary}
            })
            .addCase(getFileSummary.rejected,(state,action)=>{
                const {fileId,message}=action.payload
                state.summaries[fileId]={isLoading:false,error:message,summary:null}
            })
    },
});

export const { clearFiles, clearFileError,clearSummary } = fileSlice.actions;
export default fileSlice.reducer;