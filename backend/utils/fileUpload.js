import {v2 as cloudinary} from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadToCloud=async(file)=>{
    return new Promise((resolve,reject)=>{
        const uploadStream=cloudinary.uploader.upload_stream(
            {folder:'ensemble-tasks'},
            (error,result)=>{
                if(error){
                    reject(error)
                }
                else{
                    resolve(result)
                }
            }
        )

        uploadStream.end(file.buffer)
    })
}

export const uploadMultipleFiles=async(files)=>{
    return Promise.all(files.map(async(file)=>{
        const result=await uploadToCloud(file)
        return {
            filename:file.originalname,
            url:result.usl,
            uploadedBy:req.user._id
        }
    }))
}
