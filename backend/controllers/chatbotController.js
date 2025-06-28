import { CohereClient } from 'cohere-ai'; 

const cohere = new CohereClient({ //  initializes a Cohere API client using your secret API key from environment variables
    token: process.env.COHERE_API_KEY,
});

export const generateResponse = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body; 
        const cohereHistory = conversationHistory.map(msg => ({
            role: msg.role === 'USER' ? 'USER' : 'CHATBOT', 
            message: msg.message 
        }));

        const response = await cohere.chat({
            model: 'command-light',
            message: message,       
            chatHistory: cohereHistory,
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error('Cohere API error:', error); 
        
        const errorMessage = error.body?.message || error.message || 'Failed to generate response';
        res.status(500).json({ error: errorMessage });
    }
};