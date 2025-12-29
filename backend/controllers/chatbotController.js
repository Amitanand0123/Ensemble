import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.warn("GEMINI_API_KEY not found in .env file. AI chat features will be disabled");
}
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const generateResponse = async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: "AI Service is not configured. Missing API Key." });
        }

        const { message, conversationHistory = [] } = req.body;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const generationConfig = {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
        };

        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            }
        ];

        let history = conversationHistory.map(msg => ({
            role: msg.role === 'USER' ? 'user' : 'model',
            parts: [{ text: msg.message }]
        }));

        while (history.length > 0 && history[0].role === 'model') {
            history.shift();
        }

        const chat = model.startChat({
            generationConfig,
            safetySettings,
            history: history,
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const reply = response.text();

        res.json({ reply: reply });
    } catch (error) {
        console.error('Gemini API error:', error);

        const errorMessage = error.message || 'Failed to generate response';
        res.status(500).json({ error: errorMessage });
    }
};