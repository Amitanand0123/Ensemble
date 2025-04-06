// utils/fileUpload.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Upload a single file buffer
export const uploadToCloud = async (fileBuffer, originalFilename, folder = 'ensemble-tasks') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                // Use original filename, but let Cloudinary make it unique if needed
                public_id: originalFilename.split('.').slice(0, -1).join('.'), // Use filename without extension as base public_id
                resource_type: "auto" // Detect resource type (image, video, raw)
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    reject(error);
                } else {
                    // Return crucial details including public_id
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                        resource_type: result.resource_type,
                        format: result.format, // e.g., jpg, pdf
                        bytes: result.bytes,
                    });
                }
            }
        );
        // Pipe the buffer to the stream
        uploadStream.end(fileBuffer);
    });
};

export const deleteFromCloud=async(pubic_id)=>{
    return new Promise((Resolve,reject)=>{
        cloudinary.uploader.destroy(public_id,(error,result)=>{
            if(error){
                console.error("Cloudinary Deletion Error:",error);
                reject(error)
            }
            else{
                console.log("Cloudinary Deletion Success:",result);
                resolve(result);
            }
        })
    })
}

// --- Keep uploadMultipleFiles if used elsewhere, but we'll use uploadToCloud in the controller ---
// export const uploadMultipleFiles = async (files, userId, folder = 'ensemble-tasks') => {
//     return Promise.all(files.map(async (file) => {
//         try {
//             const result = await uploadToCloud(file.buffer, file.originalname, folder);
//             return {
//                 filename: file.originalname,
//                 url: result.url,
//                 public_id: result.public_id,
//                 mimetype: file.mimetype,
//                 size: file.size,
//                 uploadedBy: userId, // Pass userId
//                 uploadedAt: new Date()
//             };
//         } catch (error) {
//             console.error(`Failed to upload ${file.originalname}:`, error);
//             // Decide how to handle partial failures - skip? return null?
//             return null; // Or throw an error to fail the whole batch
//         }
//     }));
// }