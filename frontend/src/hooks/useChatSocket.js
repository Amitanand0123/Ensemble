import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import { addPersonalMessage, addWorkspaceMessage, addProjectMessage, setTypingStatus } from '../redux/slices/chatSlice';

export const useChatSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user);

  useEffect(() => {
    if (!token) return;
    console.log(token)
    // Create socket connection with auth token
    const newSocket = io('http://localhost:5000', {
      auth: { token :token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts:5,
      reconnectionDelay:1000,
      timeout:20000
    });

    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
      setConnectionAttempts(0);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionAttempts(prev=>prev+1)
      if(connectionAttempts<5){
        setTimeout(()=>{
          console.log('Attempting to Reconnect...');
          newSocket.connect();
        },2000)
      }
      else{
        console.log('Connection attempts exceeded');
      }
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:',reason);
      setIsConnected(false);
      if(reason==='io server disconnect'){
        setTimeout(()=>{
          newSocket.connect()
        },2000)
      }
    });

    newSocket.on('personal-message', ({ senderId, message }) => {
      console.log('Received personal message:', message);
      dispatch(addPersonalMessage({ senderId, message }));
    });

    newSocket.on('workspace-message', ({ workspaceId, message }) => {
      console.log('Received workspace message:', message);
      dispatch(addWorkspaceMessage({ workspaceId, message }));
    });

    newSocket.on('project-message', ({ projectId, message }) => {
      console.log('Received project message:', message);
      dispatch(addProjectMessage({ projectId, message }));
    });

    newSocket.on('typing-status', ({ chatType, chatId, userId, userName, isTyping }) => {
      dispatch(setTypingStatus({ chatType, chatId, userId, userName, isTyping }));
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [token, dispatch, connectionAttempts]);

  // Send a personal message
  const sendPersonalMessage = useCallback((userId, content, attachments = []) => {
    if (!socket) return Promise.reject('Socket not connected');
    
    return new Promise((resolve, reject) => {
      socket.emit('sendPersonalMessage', { receiverId: userId, content, attachments }, (response) => {
        if (response && response.success) {
          resolve(response.data);
        } else {
          reject(response?.error || 'Failed to send personal message');
        }
      });
      setTimeout(() => {
        reject('Request timed out');
      }, 5000);
    });
  }, [socket]);

  // Send a workspace message
  const sendWorkspaceMessage = useCallback((workspaceId, content) => {
    if (!socket) return Promise.reject('Socket not initialized');
    
    return new Promise((resolve, reject) => {
      console.log('Sending workspace message:',{ workspaceId, content });
      socket.emit('sendWorkspaceMessage', { workspaceId, content }, (response) => {
        console.log('Workspace message response:',response); 
        if (response && response.success) {
          if(currentUser && response.data){
            const message={
              ...response.data,
              sender:currentUser
            };
            dispatch(addWorkspaceMessage({ workspaceId, message }));
          }
          resolve(response.data);
        } else {
          reject(response?.error || 'Failed to send message');
        }
      });
      setTimeout(() => {
        reject('Request timed out');
      }, 5000);
    });
  }, [socket, currentUser,dispatch]);

  // Send a project message
  const sendProjectMessage = useCallback((projectId, content, attachments = []) => {
    if (!socket) return Promise.reject('Socket not intialized');
    
    return new Promise((resolve, reject) => {
      socket.emit('sendProjectMessage', { projectId, content, attachments }, (response) => {
        if (response && response.success) {
          if(currentUser && response.data){
            const message={
              ...response.data,
              sender:currentUser
            };
            dispatch(addProjectMessage({ projectId, message }));
          }
          resolve(response.data);
        } else {
          reject(response?.error || 'Failed to send message');
        }
      });
      setTimeout(()=>{
        reject('Request timed out')
      },5000)
    });
  }, [socket, currentUser,dispatch]);

  // Upload file for chat
  // const uploadChatFile = useCallback((file, chatType, userId, projectId, workspaceId) => {
  //   if (!socket || !isConnected) return Promise.reject('Socket not connected');
    
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const fileData = {
  //         name: file.name,
  //         type: file.type,
  //         size: file.size,
  //         data: reader.result
  //       };

  //       socket.emit('upload-file', { chatType, userId, projectId, workspaceId, file: fileData }, (response) => {
  //         if (response.success) {
  //           resolve(response.data);
  //         } else {
  //           reject(response.error);
  //         }
  //       });
  //     };
  //     reader.onerror = () => reject(new Error('File reading failed'));
  //     reader.readAsDataURL(file);
  //   });
  // }, [socket, isConnected]);

  // Set typing status
  const setTyping = useCallback((chatType, chatId, isTyping) => {
    if (!socket || !currentUser) return;
    
    socket.emit('typing-status', {
      chatType,
      chatId,
      userId: currentUser._id,
      userName: currentUser.name,
      isTyping
    });
  }, [socket, currentUser]);

  return {
    isConnected,
    sendPersonalMessage,
    sendWorkspaceMessage,
    sendProjectMessage,
    // uploadChatFile,
    setTyping
  };
};