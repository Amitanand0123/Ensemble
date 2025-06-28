import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import { addPersonalMessage, addWorkspaceMessage, addProjectMessage, setTypingStatus } from '../redux/slices/chatSlice';
import { useRef } from 'react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
let socketInstance = null;

export const useChatSocket = (token) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user);
  const [isConnected, setIsConnected] = useState(socketInstance?.connected || false);
  const currentUserRef = useRef(currentUser);  //useRef: It survives across re-renders without causing re-renders when you update it.
  
  useEffect(() => {
    currentUserRef.current = currentUser;
  },[currentUser]);

  useEffect(() => {
        if (token && (!socketInstance || !socketInstance.connected)) { 
            if (socketInstance && socketInstance.connected) { 
                console.log('[useChatSocket Hook] Socket instance exists, attempting to reconnect.');
                socketInstance.connect();
            } else { 
                console.log(`[useChatSocket Hook] Initializing new socket connection to ${SOCKET_URL}.`);
                socketInstance = io(SOCKET_URL, {
                    auth: { token },
                    reconnection: true,
                    reconnectionAttempts: 5, 
                    reconnectionDelay: 2000,
                    transports: ['websocket'],
                });
            }
            const handleConnect = () => {
                console.log('[useChatSocket] Socket connected:', socketInstance.id);
                setIsConnected(true);
            };

            const handleDisconnect = (reason) => {
                console.log('[useChatSocket] Socket disconnected. Reason:', reason);
                setIsConnected(false);   
            };
            const handleConnectError = (error) => {
                console.error('%c[useChatSocket Hook] ❌ Connection Error:', 'color: #dc3545', error.message, error);
                setIsConnected(false); 
            };
            
            const handleNewPersonalMessage = (message) => {
                if (message?.sender?._id !== currentUserRef.current?._id) {
                    dispatch(addPersonalMessage({ senderId: message.sender._id, message }));
                }
            };

            const handleNewWorkspaceMessage = (message) => {
                if (message?.sender?._id !== currentUserRef.current?._id) {
                    dispatch(addWorkspaceMessage({ workspaceId: message.workspace, message }));
                }
            };

            const handleNewProjectMessage = (message) => {
                if (message?.sender?._id !== currentUserRef.current?._id) {
                    dispatch(addProjectMessage({ projectId: message.project, message }));
                }
            };

            const handleUserTyping = (data) => {
                if (data.userId !== currentUserRef.current?._id) {
                    dispatch(setTypingStatus({
                        chatType: data.projectId ? 'project' : data.workspaceId ? 'workspace' : 'personal',
                        chatId: data.projectId || data.workspaceId || (data.receiverId === currentUserRef.current?._id ? data.userId : data.receiverId), 
                        userId: data.userId,
                        userName: data.userName || 'Someone',
                        isTyping: data.isTyping,
                    }));
                }
            };

            socketInstance.on('connect', handleConnect);
            socketInstance.on('disconnect', handleDisconnect);
            socketInstance.on('connect_error', handleConnectError);
            socketInstance.on('newPersonalMessage', handleNewPersonalMessage);
            socketInstance.on('newWorkspaceMessage', handleNewWorkspaceMessage);
            socketInstance.on('newProjectMessage', handleNewProjectMessage);
            socketInstance.on('userTyping', handleUserTyping);


        } else if (!token && socketInstance) {
            console.log("[useChatSocket] Disconnecting socket due to token removal.");
            socketInstance.disconnect();
            socketInstance = null; 
            setIsConnected(false);
        }

        return () => { 
            if (socketInstance) {
                console.log("[useChatSocket] Cleaning up socket listeners for previous instance or on unmount.");
                socketInstance.off('connect');
                socketInstance.off('disconnect');
                socketInstance.off('connect_error');
                socketInstance.off('newPersonalMessage');
                socketInstance.off('newWorkspaceMessage');
                socketInstance.off('newProjectMessage');
                socketInstance.off('userTyping');
            }
        };
    }, [token, dispatch]); 

  const sendPersonalMessage = useCallback((userId, content, attachments = []) => {
        return new Promise((resolve, reject) => {
            if (!socketInstance || !socketInstance.connected) return reject('Socket not connected');
            socketInstance.emit('sendPersonalMessage', { receiverId: userId, content, attachments }, (response) => {
                if (response?.success) {
                   dispatch(addPersonalMessage({ senderId: userId, message: response.data })); 
                   resolve(response.data);
                } else {
                  reject(response?.error || 'Failed to send message');
                }
            });
        });
    }, [dispatch]);


  const sendWorkspaceMessage = useCallback((workspaceId, content, attachments = []) => {
         return new Promise((resolve, reject) => {
            if (!socketInstance || !socketInstance.connected) return reject('Socket not connected');
            socketInstance.emit('sendWorkspaceMessage', { workspaceId, content, attachments }, (response) => {
                if (response?.success) {
                    dispatch(addWorkspaceMessage({ workspaceId, message: response.data }));
                    resolve(response.data);
                } else {
                    reject(response?.error || 'Failed to send message');
                }
            });
        });
    }, [dispatch]);


  const sendProjectMessage = useCallback((projectId, content, attachments = []) => {
         return new Promise((resolve, reject) => {
            if (!socketInstance || !socketInstance.connected) return reject('Socket not connected');
            socketInstance.emit('sendProjectMessage', { projectId, content, attachments }, (response) => {
                if (response?.success) {
                    dispatch(addProjectMessage({ projectId, message: response.data }));
                    resolve(response.data);
                } else {
                    reject(response?.error || 'Failed to send message');
                }
            });
        });
    }, [dispatch]);


  const setTyping = useCallback((chatType, chatId, isTyping) => {
        if (!socketInstance || !socketInstance.connected) return;
        socketInstance.emit('typing', {
            receiverId: chatType === 'personal' ? chatId : null,
            projectId: chatType === 'project' ? chatId : null,
            workspaceId: chatType === 'workspace' ? chatId : null,
            isTyping: isTyping,
        });
    }, []);

  return {
    isConnected,
    sendPersonalMessage,
    sendWorkspaceMessage,
    sendProjectMessage,
    setTyping
  };
};
