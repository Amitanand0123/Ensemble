import { useCallback, useEffect } from 'react'; 
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import ChatTab from '../chat/ChatTab';
import { setCurrentChat } from '../../redux/slices/chatSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

const GlobalChatHandler = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const currentChat = useSelector(state => state.chat.currentChat);

    const handleCloseChat = useCallback(() => {
        dispatch(setCurrentChat(null));
    }, [dispatch]);

    
    useEffect(() => {
        if (!currentChat) return;

        const path = location.pathname.toLowerCase();
        const { type, id } = currentChat;
        let isChatVisibleInMainContent = false;

        if (type === 'workspace' && path.startsWith(`/workspaces/${id}`)) {
            isChatVisibleInMainContent = true;
        } else if (type === 'project' && path.includes(`/projects/${id}`)) {
            isChatVisibleInMainContent = true;
        }
        
        
        if (isChatVisibleInMainContent) {
            handleCloseChat();
        }

    }, [location.pathname, currentChat, handleCloseChat]); 

    
    if (!currentChat) {
        return null;
    }
    
    const path = location.pathname.toLowerCase();
    const { type, id } = currentChat;
    if ((type === 'workspace' && path.startsWith(`/workspaces/${id}`)) || (type === 'project' && path.includes(`/projects/${id}`))) {
        return null;
    }

    return (
        <Card className="fixed bottom-0 right-0 md:right-4 md:bottom-4 z-[100] w-full max-w-sm h-[60vh] md:h-[70vh] shadow-2xl rounded-t-lg md:rounded-lg overflow-hidden flex flex-col bg-gray-900 border border-gray-700 animate-fade-in-up">
            <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800 flex-shrink-0">
                <h3 className="text-white font-semibold text-sm truncate">
                    {currentChat.type === 'personal' ? `Chat with ${currentChat.name || 'User'}` : currentChat.name || 'Chat'}
                </h3>
                <Button variant="ghost" size="icon" onClick={handleCloseChat} className="text-gray-400 hover:text-white h-6 w-6">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close chat</span>
                </Button>
            </div>
            <div className="flex-grow overflow-hidden">
                <ChatTab
                    type={currentChat.type}
                    id={currentChat.id}
                    key={`${currentChat.type}-${currentChat.id}`}
                />
            </div>
        </Card>
    );
};

export default GlobalChatHandler;