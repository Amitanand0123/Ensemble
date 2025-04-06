import mongoose, { Schema } from 'mongoose'

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxLength: [200, 'task title cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxLength: [1000, 'Task description cannot exceed 1000 characters'],
        default: ''
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true,
        index: true
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'review', 'done'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    dueDate: {
        type: Date,
        required: false
    },
    estimatedHours: {
        type: Number,
        min: 0,
        default: 0
    },
    tags: [{
        type: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments:[{
        user:{
            type:Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        content:String,
        createdAt:{type:Date,default:Date.now}
    }],
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    attachments:[{
        filename:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        },
        public_id:{
            type:String,
            required:true
        },
        mimetype:{
            type:String,
        },
        size:{
            type:Number
        },
        uploadedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        uploadedAt:{
            type:Date,
            default:Date.now
        }
    }]
}, {
    timestamps: true
});

TaskSchema.index({projects:1,status:1})
TaskSchema.index({workspace:1,project:1})
TaskSchema.index({'assignedTo.user':1,status:1})

TaskSchema.virtual('progress').get(function(){
    if(this.status==='done') return 100;
    if(this.status==='backlog') return 0;
    const statusWeight={
        'todo':25,
        'in-progress':50,
        'review':75
    }
    return statusWeight[this.status] || 0;
})

TaskSchema.methods.hasAccess=async function(userId){
    if(!userId) return false;
    const project=await mongoose.model('Project').findById(this.project)
    if(!project) return false;
    return project.isMember(userId)
}

TaskSchema.methods.getTimeLine=function(){
    const timeLine=[{
        action:'created',
        date:this.createdAt,
        user:this.createdBy
    }]
    if(this.completedAt){
        timeLine.push({
            action:'completed',
            date:this.completedAt,
            user:this.assignedTo[this.assignedTo.length-1]?.user
        })
    }
    return timeLine.sort((a,b)=>b.date-a.date);
}

export default mongoose.model('Task',TaskSchema)