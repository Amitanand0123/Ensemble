// backend/src/controllers/chatbotController.js
import { CohereClient } from 'cohere-ai'; // Use CohereClient

const cohere = new CohereClient({ // Use CohereClient
    token: process.env.COHERE_API_KEY,
});

export const generateResponse = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body; // Default history to empty array

        // Map frontend roles ('user'/'bot') to Cohere roles ('USER'/'CHATBOT')
        const cohereHistory = conversationHistory.map(msg => ({
            role: msg.role === 'USER' ? 'USER' : 'CHATBOT', // Map correctly
            message: msg.message // Use 'message' field
        }));


        const response = await cohere.chat({
            // model: 'command-r', // FIX: Use a valid model like 'command-r' or 'command-r-plus'
            model: 'command-light', // Or 'command-r-plus' etc.
            message: message,       // Pass the user's current message here
            chatHistory: cohereHistory, // Pass the mapped history
            // Other parameters like temperature can be added if needed
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error('Cohere API error:', error); // Log the detailed error
        // Provide more specific error message if possible
        const errorMessage = error.body?.message || error.message || 'Failed to generate response';
        res.status(500).json({ error: errorMessage });
    }
};