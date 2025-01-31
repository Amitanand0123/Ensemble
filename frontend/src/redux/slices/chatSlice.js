import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'

const initialState={
    personalMessages:{},
    projectMessages:{},
    currentChat:null,
    unreadCount:0,
    isLoading:false,
    error:null,
    activechats:[],
    typingUsers:{}
}

export const fetchPersonalMessages=createAsyncThunk(
    'chat/fetchPersonal',
    async (userId,{rejectWithValue})=>{
        try {
            const response=await axios.get(`/api/chats/personal/${userId}`)
            return{
                userId,
                messages:response.data.messages
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

export const fetchProjectMessages=createAsyncThunk(
    'chat/fetchProject',
    async (projectId,{rejectWithValue})=>{
        try {
            const response=await axios.get(`/api/chats/project/${projectId}`)
            return{
                projectId,
                messages:response.data.messages
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

export const markAsRead=createAsyncThunk(
    'chat/markAsRead',
    async (chatId,{rejectWithValue})=>{
        try {
            await axios.patch(`/api/chats/read/${chatId}`)
            return chatId
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

const chatSlice=createSlice({
    name:'chat',
    initialState,
    reducers:{
        setCurrentChat:(state,action)=>{
            state.currentChat=action.payload

            if(action.payload){
                const chatId=action.payload.type==='personal'?action.payload.userId:action.payload.projectId;
                state.unreadCount=0
            }
        },
        addPersonalMessage:(state,action)=>{
            const {senderId,message}=action.payload
            if(!state.personalMessages[senderId]){
                state.personalMessages[senderId]=[]
            }
            state.personalMessages[senderId].push(message)
            if(state.currentChat?.type!=='personal' || state.currentChat?.userId!==senderId){
                state.unreadCount++
            }
            
        },
        addProjectMessage:(state,action)=>{
            const {senderId,message}=action.payload
            if(!state.projectMessages[senderId]){
                state.projectMessages[senderId]=[]
            }
            state.projectMessages[senderId].push(message)
            if(state.currentChat?.type!=='project' || state.currentChat?.projectId!==senderId){
                state.unreadCount++
            }
        },
        setTypingStatus:(state,action)=>{
            const {chatId,userId,isTyping}=action.payload;
            if(!state.typingUsers[chatId]){
                state.typingUsers[chatId]=new Set()
            }
            if(isTyping){
                state.typingUsers[chatId].add(userId)
            }
            else{
                state.typingUsers[chatId].delete(userId)
            }
        },
        clearUnreadCount:(state)=>{
            state.unreadCount=0
        },
        addActiveChat:(state,action)=>{
            const chat=action.payload
            if(!state.activeChats.some(c=>(c.type===chat.type && (c.type==='personal'?c.userId===chat.userId:c.projectId===chat.projectId)))){
                state.activateChats.push(chat)
            }
        },
        removeActiveChat:(state,action)=>{
            const chat=action.payload
            state.activeChats=state.activeChats.filter(c=> !(c.type===chat.type && (c.type==='personal'?c.userId:c.projectId===chat.projectId)))
        }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(fetchPersonalMessages.pending,(state)=>{
                state.isLoading=true
            })
            .addCase(fetchPersonalMessages.fulfilled,(state,action)=>{
                const {userId,messages}=action.payload
                state.personalMessages[userId]=messages
                state.isLoading=false
                state.error=null
            })
            .addCase(fetchPersonalMessages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchProjectMessages.pending,(state)=>{
                state.isLoading=true
            })
            .addCase(fetchProjectMessages.fulfilled,(state,action)=>{
                const {projectId,messages}=action.payload
                state.projectMessages[projectId]=messages
                state.isLoading=false
            })
            .addCase(fetchProjectMessages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(markAsRead.fulfilled,(state,action)=>{
                const chatId=action.payload
                const markMessageAsread=(message)=>{
                    if(message._id===chatId && !message.readBy.includes(state.currentChat.userId)){
                        message.readBy.push(state.currentChat.userId)
                    }
                }
                Object.values(state.personalMessages).forEach(messages=>{
                    messages.forEach(markMessageAsread)
                })
                Object.values(state.projectMessages).forEach(messages=>{
                    messages.forEach(markMessageAsread)
                })
            })
    }
})

export const {setCurrentChat,addPersonalMessage,addProjectMessage,setTypingStatus,clearUnreadCount,addActiveChat,removeActiveChat}=chatSlice.actions
export const selectCurrentChat=(state)=>state.chat.currentChat
export const selectPersonalMessages=(state)=>state.chat.personalMessages[userId] || []
export const selectProjectMessages=(state)=>state.chat.projectMessages[projectId] || []
export const selectTypingUsers=(state)=>state.chat.typingUsers[chatId] || new Set()
export const selectUnreadCount=(state)=>state.chat.unreadCount
export const selectActiveChats=(state)=>state.chat.activeChats

export default chatSlice.reducer