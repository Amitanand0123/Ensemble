import mongoose from 'mongoose'

const ProjectSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Project name is required'],
        trim:true,
        maxLength:[100,'Project name cannotexceed 100 characters']
    },
    description:{
        type:String,
        maxLength:[1000,'Project description cannot exceed 1000 characters']
    },
    workspace:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Workspace',
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    members:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        role:{
            type:String,
            enum:['admin','member','viewer'],
            default:'member'
        },
        status:{
            type:String,
            enum:['active','pending','inactive'],
            default:'active'
        }
    }],
    status:{
        type:String,
        enum:['not_started','in_progress','on_hold','high','completed'],
        default:'not_started'
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
    endDate:{
        type:Date
    },
    settings:{
        isPrivate:{
            type:Boolean,
            default:false
        },
        tags:[String],
        visibility:{
            type:String,
            enum:['workspace','members','admins'],
            default:'workspace'
        }
    }
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

ProjectSchema.methods.isMember=function(userId){
    return this.members.some(member=>
        member.user.toString()===userId.toString() && 
        member.status==='active'
    )
}

ProjectSchema.methods.isAdmin=function(userId){
    return this.members.some(member=>
        member.user.toString()===userId.toString() && 
        member.role==='admin' && 
        member.status==='active'
    )
}

export default mongoose.model('Project',ProjectSchema)