import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  personalMessages: {},
  workspaceMessages: {},
  projectMessages: {},
  currentChat: null,
  unreadCount: 0,
  isLoading: false,
  error: null,
  activeChats: [],
  typingUsers: {
    personal: {},
    workspace: {},
    project: {}
  }
};

export const fetchPersonalMessages = createAsyncThunk(
  'chat/fetchPersonal',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/chat/personal/${userId}`);
      return {
        userId,
        messages: response.data.messages
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchWorkspaceMessages = createAsyncThunk(
  'chat/fetchWorkspace',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/chat/workspace/${workspaceId}`);
      return {
        workspaceId,
        messages: response.data.messages
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProjectMessages = createAsyncThunk(
  'chat/fetchProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/chat/project/${projectId}`);
      return {
        projectId,
        messages: response.data.messages
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'chat/markAsRead',
  async (chatId, { rejectWithValue }) => {
    try {
      await axios.patch(`/api/chat/read/${chatId}`);
      return chatId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;

      if (action.payload) {
        
        state.unreadCount = 0;
      }
    },
    addPersonalMessage: (state, action) => {
      const {  message } = action.payload;
      const chatKey = message.sender === state.currentChat?.userId ? message.receiver : message.sender; 

      if (!state.personalMessages[chatKey]) {
        state.personalMessages[chatKey] = [];
      }
      
      if (!state.personalMessages[chatKey].find(m => m._id === message._id)) {
        state.personalMessages[chatKey].push(message);
      }
      
      
      if (!state.currentChat || state.currentChat.type !== 'personal' || state.currentChat.id !== chatKey) {
        state.unreadCount++;
      }
    },
    addWorkspaceMessage: (state, action) => {
      const { workspaceId, message } = action.payload;
      if (!state.workspaceMessages[workspaceId]) {
        state.workspaceMessages[workspaceId] = [];
      }
       
      if (!state.workspaceMessages[workspaceId].find(m => m._id === message._id)) {
        state.workspaceMessages[workspaceId].push(message);
      }
      
      if (!state.currentChat || state.currentChat.type !== 'workspace' || state.currentChat.id !== workspaceId) {
        state.unreadCount++;
      }
    },
    addProjectMessage: (state, action) => {
      const { projectId, message } = action.payload;
      if (!state.projectMessages[projectId]) {
        state.projectMessages[projectId] = [];
      }
      
      if (!state.projectMessages[projectId].find(m => m._id === message._id)) {
        state.projectMessages[projectId].push(message);
      }
      
      if (!state.currentChat || state.currentChat.type !== 'project' || state.currentChat.id !== projectId) {
        state.unreadCount++;
      }
    },
    setTypingStatus: (state, action) => {
      const { chatType, chatId, userId, userName, isTyping } = action.payload;
      
      if (!state.typingUsers[chatType]) {
        state.typingUsers[chatType] = {};
      }
      
      if (!state.typingUsers[chatType][chatId]) {
        state.typingUsers[chatType][chatId] = {};
      }
      
      if (isTyping) {
        state.typingUsers[chatType][chatId][userId] = userName;
      } else {
        delete state.typingUsers[chatType][chatId][userId];
        
        if (Object.keys(state.typingUsers[chatType][chatId]).length === 0) {
          delete state.typingUsers[chatType][chatId];
        }
        
        if (Object.keys(state.typingUsers[chatType]).length === 0) {
          delete state.typingUsers[chatType];
        }
      }
    },
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    addActiveChat: (state, action) => {
      const chat = action.payload;
      
      const exists = state.activeChats.some(c => 
        c.type === chat.type && c.id === chat.id
      );
      
      if (!exists) {
        state.activeChats.push(chat);
      }
    },
    removeActiveChat: (state, action) => {
      const chatIdentifier = action.payload; 
      state.activeChats = state.activeChats.filter(c => 
        !(c.type === chatIdentifier.type && c.id === chatIdentifier.id)
      );
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersonalMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPersonalMessages.fulfilled, (state, action) => {
        const { userId, messages } = action.payload;
        state.personalMessages[userId] = messages;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchPersonalMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchWorkspaceMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWorkspaceMessages.fulfilled, (state, action) => {
        const { workspaceId, messages } = action.payload;
        state.workspaceMessages[workspaceId] = messages;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchWorkspaceMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProjectMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProjectMessages.fulfilled, (state, action) => {
        const { projectId, messages } = action.payload;
        state.projectMessages[projectId] = messages;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchProjectMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const chatId = action.payload; 
        const currentUserId = state.auth?.user?._id; 
        
        if (!currentUserId) return;
        
        const markMessageAsReadInList = (messageList) => {
          if (!messageList) return;
          const message = messageList.find(m => m._id === chatId);
          if (message && !message.readBy.some(reader => reader.user === currentUserId)) {
            message.readBy.push({ user: currentUserId, readAt: new Date().toISOString() });
          }
        };
        
        
        Object.values(state.personalMessages).forEach(markMessageAsReadInList);
        Object.values(state.workspaceMessages).forEach(markMessageAsReadInList);
        Object.values(state.projectMessages).forEach(markMessageAsReadInList);

        
      });
  }
});

export const {
  setCurrentChat,
  addPersonalMessage,
  addWorkspaceMessage,
  addProjectMessage,
  setTypingStatus,
  clearUnreadCount,
  addActiveChat,
  removeActiveChat
} = chatSlice.actions;


export const selectCurrentChatInfo = (state) => state.chat.currentChat;

const emptyArray = []; 
const emptyObject = {}; 

export const selectPersonalMessages = (userId) => (state) => state.chat.personalMessages[userId] || emptyArray;
export const selectWorkspaceMessages = (workspaceId) => (state) => state.chat.workspaceMessages[workspaceId] || emptyArray;
export const selectProjectMessages = (projectId) => (state) => state.chat.projectMessages[projectId] || emptyArray;

export const selectTypingUsers = (chatType, chatId) => (state) => {
  return state.chat.typingUsers?.[chatType]?.[chatId] || emptyObject;
};
export const selectUnreadCount = (state) => state.chat.unreadCount;
export const selectActiveChats = (state) => state.chat.activeChats;
export const selectChatIsLoading = (state) => state.chat.isLoading;
export const selectChatError = (state) => state.chat.error;


export default chatSlice.reducer;