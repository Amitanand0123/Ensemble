import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'

const initialState={
    notifications:[],
    unreadCount:0,
    isLoading:false,
    error:null
}

export const fetchNotifications=createAsyncThunk(
    'notofications/fetchAll',
    async (_,{rejectWithValue})=>{
        try {
            const response=await axios.get('/api/notifications')
            return response.data.notifications
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const markNotificationAsRead=createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId,{rejectWithValue})=>{
        try {
            await axios.patch(`/api/notifications/${notificationId}/read`)
            return notificationId
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const markAllNotificationsAsRead=createAsyncThunk(
    'notifications/markAllAsRead',
    async (_,{rejectWithValue})=>{
        try {
            await axios.patch(`/api/notifications/read-all`)
            return true
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

const notificationSlice=createSlice({
    name:'notifications',
    initialState,
    reducers:{
        addNotification:(state,action)=>{
            state.notifications.unshift(action.payload)
            if(!action.payload.read){
                state.unreadCount++;
            }
        },
        clearNotifications:(state)=>{
            state.notifications=[]
            state.unreadCount=0
        }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(fetchNotifications.pending,(state)=>{
                state.isLoading=true
            })
            .addCase(fetchNotifications.fulfilled,(state,action)=>{
                state.notifications=action.payload
                state.unreadCount=action.payload.filter(n=>!n.read).length
                state.isLoading=false
            })
            .addCase(markNotificationAsRead.fulfilled,(state,action)=>{
                const notification=state.notifications.find(n=>n._id===action.payload)
                if(notification && !notification.read){
                    notification.read=true
                    state.unreadCount--
                }
            })
            .addCase(markAllNotificationsAsRead.fulfilled,(state)=>{
                state.notifications.forEach(notification=>{
                    notification.read=true
                })
                state.unreadCount=0
            })
    }
})

export const {addNotification,clearNotifications}=notificationSlice.actions
export default notificationSlice.reducer