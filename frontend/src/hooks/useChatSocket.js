// --- START OF FILE frontend/src/hooks/useChatSocket.js ---

import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import { addPersonalMessage, addWorkspaceMessage, addProjectMessage, setTypingStatus } from '../redux/slices/chatSlice'; // Import actions

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const useChatSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  // const [connectionAttempts, setConnectionAttempts] = useState(0); // Manage retries if needed
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user); // Get user info needed for sender details

  useEffect(() => {
    if (!token) {
        console.log("[useChatSocket] No token, socket not initialized.");
        // Ensure cleanup if token disappears
        if (socket) {
            socket.disconnect();
            setSocket(null);
            setIsConnected(false);
        }
        return;
    }

    // Prevent creating multiple sockets if token hasn't changed
    if (socket?.connected && socket?.auth?.token === token) {
        console.log("[useChatSocket] Socket already connected with the same token.");
        return;
    }

    // Disconnect previous socket if exists before creating a new one
    if (socket) {
        console.log("[useChatSocket] Disconnecting previous socket instance.");
        socket.disconnect();
    }

    console.log(`[useChatSocket] Initializing socket connection to ${SOCKET_URL} with token.`);
    const newSocket = io(SOCKET_URL, {
      auth: { token: token }, // Pass token correctly
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000, // Slightly increased delay
      timeout: 10000 // Slightly shorter timeout
    });

    newSocket.on('connect', () => {
      console.log('[useChatSocket] Socket connected successfully. ID:', newSocket.id);
      setIsConnected(true);
      // setConnectionAttempts(0);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[useChatSocket] Connection error:', error.message);
      setIsConnected(false); // Ensure state reflects disconnected
      // Optional: Implement retry logic here or rely on built-in reconnection
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[useChatSocket] Socket disconnected:', reason);
      setIsConnected(false);
       // Attempt to reconnect if disconnected unexpectedly
       if (reason !== 'io client disconnect') { // Don't auto-reconnect on manual disconnect
         console.log('[useChatSocket] Attempting to reconnect after unexpected disconnect...');
         // setTimeout(() => newSocket.connect(), 5000); // Optional manual reconnect attempt
       }
    });

    // --- Event Listeners for Receiving Messages ---
    // Note: These listeners dispatch actions based on INCOMING messages from others

    newSocket.on('newPersonalMessage', (message) => { // Match backend event name
      console.log('[useChatSocket] Received personal message:', message);
      if (message?.sender?._id !== currentUser?._id) { // Don't add own messages again here
        dispatch(addPersonalMessage({ senderId: message.sender._id, message }));
      }
    });

    newSocket.on('newWorkspaceMessage', (message) => { // Match backend event name
      console.log('[useChatSocket] Received workspace message:', message);
       if (message?.sender?._id !== currentUser?._id) { // Don't add own messages again here
        dispatch(addWorkspaceMessage({ workspaceId: message.workspace, message }));
      }
    });

    newSocket.on('newProjectMessage', (message) => { // Match backend event name
      console.log('[useChatSocket] Received project message:', message);
      if (message?.sender?._id !== currentUser?._id) { // Don't add own messages again here
        dispatch(addProjectMessage({ projectId: message.project, message }));
      }
    });

    // --- Typing Status Listener ---
    newSocket.on('userTyping', (data) => { // Match backend event name
        // Avoid showing typing indicator for self
        if (data.userId !== currentUser?._id) {
            dispatch(setTypingStatus({
                chatType: data.projectId ? 'project' : data.workspaceId ? 'workspace' : 'personal',
                chatId: data.projectId || data.workspaceId || data.userId, // The ID of the chat context
                userId: data.userId,
                userName: data.userName || 'Someone', // Add userName if sent from backend
                isTyping: data.isTyping,
            }));
        }
    });


    setSocket(newSocket);

    // Cleanup: Disconnect socket when hook unmounts or token changes
    return () => {
      console.log("[useChatSocket] Cleanup: Disconnecting socket.");
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, dispatch, currentUser?._id]); // Add currentUser._id dependency


  // --- Functions to Send Messages ---

  // Send a personal message
  const sendPersonalMessage = useCallback((userId, content, attachments = []) => {
    if (!socket || !isConnected) return Promise.reject('Socket not connected');
    if (!currentUser) return Promise.reject('User not loaded');

    return new Promise((resolve, reject) => {
      console.log('[useChatSocket] Emitting sendPersonalMessage', { receiverId: userId, content, attachments });
      socket.emit('sendPersonalMessage', { receiverId: userId, content, attachments }, (response) => {
        console.log('[useChatSocket] Callback for sendPersonalMessage:', response);
        if (response && response.success && response.data) {
           // **Dispatch to update local state immediately**
           // Ensure sender details are populated if needed by the reducer/component
           const messageWithSender = {
                ...response.data,
                sender: { // Mimic populated sender
                    _id: currentUser._id,
                    name: currentUser.name,
                    avatar: currentUser.avatar
                }
           };
           dispatch(addPersonalMessage({ senderId: userId, message: messageWithSender })); // Use receiverId as key
           resolve(response.data);
        } else {
          reject(response?.error || 'Failed to send personal message');
        }
      });
       // Timeout for the callback
       const timer = setTimeout(() => reject('Send message request timed out'), 10000); // 10 sec timeout
       // Clear timeout if callback received
       socket.once('sendPersonalMessage_response', () => clearTimeout(timer)); // Requires backend to emit confirmation event if callback fails
    });
  }, [socket, isConnected, dispatch, currentUser]); // Add dispatch and currentUser


  // Send a workspace message
  const sendWorkspaceMessage = useCallback((workspaceId, content, attachments = []) => {
    if (!socket || !isConnected) return Promise.reject('Socket not connected');
    if (!currentUser) return Promise.reject('User not loaded');

    return new Promise((resolve, reject) => {
        console.log('[useChatSocket] Emitting sendWorkspaceMessage', { workspaceId, content, attachments });
        socket.emit('sendWorkspaceMessage', { workspaceId, content, attachments }, (response) => {
            console.log('[useChatSocket] Callback for sendWorkspaceMessage:', response);
            if (response && response.success && response.data) {
                // **Dispatch to update local state immediately**
                const messageWithSender = {
                    ...response.data,
                     sender: { // Mimic populated sender
                        _id: currentUser._id,
                        name: currentUser.name,
                        avatar: currentUser.avatar
                    }
                };
                dispatch(addWorkspaceMessage({ workspaceId, message: messageWithSender }));
                resolve(response.data);
            } else {
                reject(response?.error || 'Failed to send workspace message');
            }
        });
        const timer = setTimeout(() => reject('Send message request timed out'), 10000);
        // socket.once('sendWorkspaceMessage_response', () => clearTimeout(timer)); // Optional confirmation event
    });
}, [socket, isConnected, dispatch, currentUser]); // Add dispatch and currentUser


  // Send a project message
  const sendProjectMessage = useCallback((projectId, content, attachments = []) => {
    if (!socket || !isConnected) return Promise.reject('Socket not connected');
    if (!currentUser) return Promise.reject('User not loaded');

    return new Promise((resolve, reject) => {
        console.log('[useChatSocket] Emitting sendProjectMessage', { projectId, content, attachments });
        socket.emit('sendProjectMessage', { projectId, content, attachments }, (response) => {
            console.log('[useChatSocket] Callback for sendProjectMessage:', response);
            if (response && response.success && response.data) {
                 // **Dispatch to update local state immediately**
                 const messageWithSender = {
                    ...response.data,
                    sender: { // Mimic populated sender
                        _id: currentUser._id,
                        name: currentUser.name,
                        avatar: currentUser.avatar
                    }
                };
                dispatch(addProjectMessage({ projectId, message: messageWithSender }));
                resolve(response.data);
            } else {
                reject(response?.error || 'Failed to send project message');
            }
        });
         const timer = setTimeout(() => reject('Send message request timed out'), 10000);
         // socket.once('sendProjectMessage_response', () => clearTimeout(timer)); // Optional confirmation event
    });
}, [socket, isConnected, dispatch, currentUser]); // Add dispatch and currentUser


  // Set typing status
  const setTyping = useCallback((chatType, chatId, isTyping) => {
    if (!socket || !isConnected || !currentUser) return;

    console.log(`[useChatSocket] Emitting typing status: ${isTyping} for ${chatType}:${chatId}`);
    socket.emit('typing', { // Match backend listener event name 'typing'
        // Determine the correct ID field based on type
        receiverId: chatType === 'personal' ? chatId : null,
        projectId: chatType === 'project' ? chatId : null,
        workspaceId: chatType === 'workspace' ? chatId : null,
        isTyping: isTyping
        // userId is automatically available on the backend via socket.user
    });
  }, [socket, isConnected, currentUser]);

  return {
    isConnected,
    sendPersonalMessage,
    sendWorkspaceMessage,
    sendProjectMessage,
    setTyping
  };
};
// --- END OF FILE frontend/src/hooks/useChatSocket.js ---