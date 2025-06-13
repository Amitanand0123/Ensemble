
import { useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import { Card } from '@/components/ui/card'; 
import {
  fetchPersonalMessages,
  fetchWorkspaceMessages,
  fetchProjectMessages,
  setCurrentChat,
  selectPersonalMessages, 
  selectWorkspaceMessages,
  selectProjectMessages,
  selectChatIsLoading
} from '../../redux/slices/chatSlice.js'; 
import { useChatSocket } from '../../hooks/useChatSocket.js'; 
import { Loader2 } from 'lucide-react'; 
import PropTypes from 'prop-types';

const ChatTab = ({ type, id }) => {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const { isConnected } = useChatSocket(token); 

  
  
  const messagesSelector = 
    type === 'workspace' ? selectWorkspaceMessages(id) :
    type === 'project' ? selectProjectMessages(id) :
    type === 'personal' ? selectPersonalMessages(id) :
    () => []; 

  const messages = useSelector(messagesSelector);
  const isLoading = useSelector(selectChatIsLoading); 
  const currentUserId = useSelector(state => state.auth.user?.id); 

  
  useEffect(() => {
    if (id && type) { 
        let fetchAction;
        if (type === 'workspace') {
            fetchAction = fetchWorkspaceMessages(id);
        } else if (type === 'project') {
            fetchAction = fetchProjectMessages(id);
        } else if (type === 'personal') {
            fetchAction = fetchPersonalMessages(id);
        }
        
        if (fetchAction) {
            dispatch(fetchAction);
        }
        dispatch(setCurrentChat({ type, id, name: "Loading..." })); 
    }

    return () => {
        dispatch(setCurrentChat(null));
    };
  }, [dispatch, type, id]); 

  const renderContent = () => {
    if (isLoading && messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            Loading messages...
        </div>
      );
    }
    return <MessageList messages={messages} currentUserId={currentUserId} />;
  };


  return (
    <Card className="h-[calc(100vh-250px)] flex flex-col bg-gray-900 border-gray-700">
      <ChatHeader chatType={type} targetId={id} />
      <div className="flex-1 overflow-y-auto p-4 bg-gray-850 custom-scrollbar">
        {renderContent()}
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <MessageInput chatType={type} targetId={id} isConnected={isConnected} />
      </div>
    </Card>
  );
};

ChatTab.propTypes = {
  type: PropTypes.oneOf(['workspace', 'project', 'personal']).isRequired,
  id: PropTypes.string.isRequired
};

export default ChatTab;