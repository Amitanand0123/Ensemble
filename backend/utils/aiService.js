import {GoogleGenerativeAI,HarmCategory,HarmBlockThreshold} from "@google/generative-ai"
import dotenv from 'dotenv'

dotenv.config()

const API_KEY=process.env.GEMINI_API_KEY
if(!API_KEY){
    console.warn("GEMINI_API_KEY not found in .env file.AI features will be disabled")
}
const genAI=API_KEY? new GoogleGenerativeAI(API_KEY):null

export const summarizeText = async (text, filename = "this file") => {
    if (!genAI) {
        throw new Error("AI Service is not configured. Missing API Key.");
    }
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return "Cannot summarize empty or invalid content.";
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
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

    const MAX_TEXT_LENGTH = 15000;
    const truncatedText = text.length > MAX_TEXT_LENGTH ? text.substring(0, MAX_TEXT_LENGTH) + "..." : text;
    const prompt = `You are an expert summarizer for a project management tool. Summarize the following content from the file named "${filename}". Focus on the key points, code, purpose and potential use case within a project context. Keep the summary concise (3-4 sentences).
                Content:
                ---
                ${truncatedText}
                ---
                Summary:`;

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
            safetySettings
        });
        const response = result.response;
        const summary = response.text();
        if (!summary) {
            if (response.promptFeedback?.blockReason) {
                console.warn(`Summary generation blocked for ${filename}.`);
                return `Content could not be summarized due to safety restrictions (${response.promptFeedback.blockReason}).`;
            }
            console.warn(`Empty summary received for ${filename}.`);
            return "Could not generate a summary for this content.";
        }
        return summary.trim();
    } catch (error) {
        console.error(`Error generating summary for ${filename}:`, error);
        if (error.message.includes('quota')) {
            return "AI service quota exceeded. Please try again later.";
        }
        if (error.message.includes('not found')) {
            return "AI model not found. Please check your configuration.";
        }
        return "An error occurred while generating the summary.";
    }
};

export const extractTexFromFile=async(fileUrl,mimetype)=>{
    if(mimetype==='text/plain'){
        try {
            const response=await fetch(fileUrl)
            if(!response.ok){
                throw new Error(`Failed to fetch file: ${response.statusText}`)
            }
            return await response.text()
        } catch (error) {
            console.error("Error fetching plain text content:",error)
            throw new Error("Could not read the text file content.")
        }
    }

    if(mimetype==='application/pdf'){
        try {
            const {default:pdf}=await import('pdf-parse')
            const response=await fetch(fileUrl)
            if(!response.ok){
                throw new Error(`Failed to fetch PDF: ${response.statusText}`)
            }
            const buffer=await response.arrayBuffer()
            const data=await pdf(buffer)
            return data.text
        } catch (error) {
            console.error("Error parsing PDF:",error)
            throw new Error("Could not extract text from the PDF file.")
        }
    }

    if(mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
        try {
            const mammoth = await import('mammoth');
            const response = await fetch(fileUrl);
            if(!response.ok){
                throw new Error(`Failed to fetch DOCX: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            if (arrayBuffer.byteLength === 0) {
                console.error("[aiService - DOCX] Fetched buffer is empty!");
                throw new Error("Fetched DOCX file content is empty.");
            }
            const result = await mammoth.extractRawText({
                buffer: Buffer.from(arrayBuffer)
            });
            return result.value;
        } catch (error) {
            console.error("--- ERROR DURING DOCX PROCESSING ---");
            console.error("Error Object:", error);
            console.error("Error Message:", error?.message);
            console.error("Error Stack:", error?.stack);
            console.error("--- END ERROR DETAILS ---");
            throw new Error("Could not extract text from the DOCX file.");
        }
    }
    console.warn(`Unsupported file type for text extraction:${mimetype}`)
    throw new Error(`File type ${mimetype} is not supported for summarization`)
}
