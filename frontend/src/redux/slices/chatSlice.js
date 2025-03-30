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
      const response = await axios.get(`/api/chats/personal/${userId}`);
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
      const response = await axios.get(`/api/chats/workspace/${workspaceId}`);
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
      const response = await axios.get(`/api/chats/project/${projectId}`);
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
      await axios.patch(`/api/chats/read/${chatId}`);
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
        // Reset unread count when user opens chat
        state.unreadCount = 0;
      }
    },
    addPersonalMessage: (state, action) => {
      const { senderId, message } = action.payload;
      if (!state.personalMessages[senderId]) {
        state.personalMessages[senderId] = [];
      }
      state.personalMessages[senderId].push(message);
      
      // Only increment unread count if not currently viewing this chat
      if (!state.currentChat || state.currentChat.type !== 'personal' || state.currentChat.userId !== senderId) {
        state.unreadCount++;
      }
    },
    addWorkspaceMessage: (state, action) => {
      const { workspaceId, message } = action.payload;
      if (!state.workspaceMessages[workspaceId]) {
        state.workspaceMessages[workspaceId] = [];
      }
      state.workspaceMessages[workspaceId].push(message);
      
      // Only increment unread count if not currently viewing this chat
      if (!state.currentChat || state.currentChat.type !== 'workspace' || state.currentChat.workspaceId !== workspaceId) {
        state.unreadCount++;
      }
    },
    addProjectMessage: (state, action) => {
      const { projectId, message } = action.payload;
      if (!state.projectMessages[projectId]) {
        state.projectMessages[projectId] = [];
      }
      state.projectMessages[projectId].push(message);
      
      // Only increment unread count if not currently viewing this chat
      if (!state.currentChat || state.currentChat.type !== 'project' || state.currentChat.projectId !== projectId) {
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
      }
    },
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    addActiveChat: (state, action) => {
      const chat = action.payload;
      // Check if already exists
      const exists = state.activeChats.some(c => 
        c.type === chat.type && 
        ((c.type === 'personal' && c.userId === chat.userId) || 
         (c.type === 'workspace' && c.workspaceId === chat.workspaceId) ||
         (c.type === 'project' && c.projectId === chat.projectId))
      );
      
      if (!exists) {
        state.activeChats.push(chat);
      }
    },
    removeActiveChat: (state, action) => {
      const chat = action.payload;
      state.activeChats = state.activeChats.filter(c => {
        if (c.type !== chat.type) return true;
        
        if (c.type === 'personal') {
          return c.userId !== chat.userId;
        } else if (c.type === 'workspace') {
          return c.workspaceId !== chat.workspaceId;
        } else if (c.type === 'project') {
          return c.projectId !== chat.projectId;
        }
        return true;
      });
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
        // Update read status
        const chatId = action.payload;
        const currentUserId = state.currentChat?.userId;
        
        if (!currentUserId) return;
        
        const markMessageAsRead = (message) => {
          if (message._id === chatId && !message.readBy.includes(currentUserId)) {
            message.readBy.push(currentUserId);
          }
        };
        
        Object.values(state.personalMessages).forEach(messages => {
          messages.forEach(markMessageAsRead);
        });
        
        Object.values(state.workspaceMessages).forEach(messages => {
          messages.forEach(markMessageAsRead);
        });
        
        Object.values(state.projectMessages).forEach(messages => {
          messages.forEach(markMessageAsRead);
        });
      })
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

// Selectors
export const selectCurrentChat = (state) => state.chat.currentChat;
export const selectPersonalMessages = (userId) => (state) => state.chat.personalMessages[userId] || [];
export const selectWorkspaceMessages = (workspaceId) => (state) => state.chat.workspaceMessages[workspaceId] || [];
export const selectProjectMessages = (projectId) => (state) => state.chat.projectMessages[projectId] || [];
export const selectTypingUsers = (chatType, chatId) => (state) => {
  if (!state.chat.typingUsers[chatType]) return {};
  return state.chat.typingUsers[chatType][chatId] || {};
};
export const selectUnreadCount = (state) => state.chat.unreadCount;
export const selectActiveChats = (state) => state.chat.activeChats;

export default chatSlice.reducer;
