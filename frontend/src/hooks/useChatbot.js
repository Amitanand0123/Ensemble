import { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

export const useChatbot = () => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = useSelector(state => state.auth.token);
  const sendMessage = async (message) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/chatbot/generate', 
        { message, conversationHistory },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const updatedHistory = [
        ...conversationHistory,
        { role: 'USER', message },
        { role: 'CHATBOT', message: response.data.reply }
      ];
      setConversationHistory(updatedHistory);
      setIsLoading(false);
      return response.data.reply;
    } catch (error) {
      console.error('Chatbot error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  return {
    sendMessage,
    isLoading,
    conversationHistory
  };
};