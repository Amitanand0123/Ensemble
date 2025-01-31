import React from 'react'
import { useChatSocket } from '../../hooks/useChatSocket'

const FileUpload=({chatType,targetId,setIsUploading})=>{
    const {uploadChatFile}=useChatSocket(localStorage.getItem('token'))

    const handleFileChange=async(e)=>{
        const file=e.target.files?.[0]
        if(!file) return 
        try {
            setIsUploading(true)
            await uploadChatFile(file,chatType,chatType==='personal'?targetId:undefined,chatType==='project'?targetId:undefined)
        } catch (error) {
            console.error('Error uploading file:',error)
        } finally{
            setIsUploading(false)
        }
    }

    return (
        <div>
            <input type="file"
                onChange={handleFileChange}
                className='hidden'
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            />
            <lablel htmlFor="file-upload" className='cursor-pointer'>
                📎
            </lablel>
        </div>
    )
}

export default FileUpload