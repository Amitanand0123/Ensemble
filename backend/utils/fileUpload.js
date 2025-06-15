
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET 
});


export const uploadToCloud = async (fileBuffer, originalFilename, folder = 'ensemble-tasks') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                
                public_id: originalFilename.split('.').slice(0, -1).join('.'), 
                resource_type: "auto" 
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    reject(error);
                } else {
                    
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                        resource_type: result.resource_type,
                        format: result.format, 
                        bytes: result.bytes,
                    });
                }
            }
        );
        
        uploadStream.end(fileBuffer);
    });
};

export const deleteFromCloud=async(public_id)=>{
    return new Promise((resolve,reject)=>{
        cloudinary.uploader.destroy(public_id,(error,result)=>{
            if(error){
                console.error("Cloudinary Deletion Error:",error);
                reject(error)
            }
            else{
                resolve(result);
            }
        })
    })
}





















