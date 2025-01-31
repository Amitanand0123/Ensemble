import mongoose from 'mongoose'

const TaskSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,'Task title is required'],
        trim:true,
        maxLength:[200,'task title cannot exceed 200 characters']
    },
    description:{
        type:String,
        maxLength:[1000,'Task description cannot exceed 1000 charaters']
    },
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project',
        required:true
    },
    workspace:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Workspace',
        required:true
    },
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    status:{
        type:String,
        enum:['todo','in-progress','review','done'],
        default:'todo'
    },
    priority:{
        type:String,
        enum:['low','medium','high','critical'],
        default:'medium'
    },
    startDate:{
        type:Date,
        default:Date.now
    },
    dueDate:{
        type:Date
    },
    tags:[String],
    attachments:[{
        filename:String,
        url:String,
        uploadedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        uploadedAt:{
            type:Date,
            default:Date.now
        }
    }],
    comments:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        content:{
            type:String,
            required:true
        },
        createdAt:{
            type:Date,
            default:Date.now
        }
    }]
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

export default mongoose.model('Task',TaskSchema)