
import mammoth from 'mammoth';
import fs from 'fs/promises'; 
import path from 'path';
import { fileURLToPath } from 'url'; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDocxExtraction() {
    const filePath = path.join(__dirname, 'test.docx'); 
    

    try {
        
        const fileBuffer = await fs.readFile(filePath);
        

        if (fileBuffer.byteLength === 0) {
            console.error("Test file is empty!");
            return;
        }

        
        
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        console.log(result.value);
        
        
        
        

    } catch (error) {
        
        console.error("Error Object:", error);
        
        
        
    }
}

testDocxExtraction();