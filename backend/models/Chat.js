import mongoose from 'mongoose'

const ChatSchema=new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project'
    },
    workspace:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Workspace'
    },
    content:{
        type:String,
        required:true,
        trim:true
    },
    type:{
        type:String,
        enum:['personal','project','workspace'],
        required:true
    },
    readBy:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        readAt:{
            type:Date,
            default:Date.now()
        }
    }],
    attachments:[{
        filename:String,
        url:String,
        type:String
    }]
},{
    timestamps:true
})


export default mongoose.model('Chat',ChatSchema)