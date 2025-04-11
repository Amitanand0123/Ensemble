// testMammoth.js
import mammoth from 'mammoth';
import fs from 'fs/promises'; // Use promises version of fs
import path from 'path';
import { fileURLToPath } from 'url'; // Helper for __dirname in ESM

// Helper to get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDocxExtraction() {
    const filePath = path.join(__dirname, 'test.docx'); // Path to your test file
    // console.log(`Attempting to read file: ${filePath}`);

    try {
        // Read the local file into a buffer
        const fileBuffer = await fs.readFile(filePath);
        // console.log(`Read file successfully, buffer size: ${fileBuffer.byteLength} bytes.`);

        if (fileBuffer.byteLength === 0) {
            console.error("Test file is empty!");
            return;
        }

        // console.log("Attempting mammoth.extractRawText...");
        // Use the buffer directly
        const result = await mammoth.extractRawText({ buffer: fileBuffer });

        // console.log("--- Mammoth Extraction Result ---");
        // console.log("Value:", result.value); // The extracted text
        // console.log("Messages:", result.messages); // Any warnings/errors from mammoth
        // console.log("--- Extraction Successful ---");

    } catch (error) {
        // console.error("--- ERROR IN TEST SCRIPT ---");
        console.error("Error Object:", error);
        // console.error("Error Message:", error?.message);
        // console.error("Error Stack:", error?.stack);
        // console.error("--- END ERROR DETAILS ---");
    }
}

testDocxExtraction();