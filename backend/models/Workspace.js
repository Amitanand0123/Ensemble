import mongoose from 'mongoose';

const WorkspaceSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Workspace name is required'],
        trim:true,
        maxLength:[50,'Name cannot be more than 50 characters']
    },

    description:{
        type:String,
        maxlength:[500,'Description cannot be more than 500 chracters']
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
            enum:['admin','member'],
            default:'member'
        },
        joinedAt:{
            type:Date,
            default:Date.now
        }
    }],

    settings:{
        isPrivate:{
            type:Boolean,
            default:false
        },
        joinByCode:{
            type:Boolean,
            default:true
        },
        inviteCode:{
            type:String,
            unique:true,
            sparse:true
        },
        theme:{
            type:String,
            enum:['light','dark'],
            default:'light'
        },
        features:{
            tasks:{type:Boolean,default:true},
            chat:{type:Boolean,default:true},
            files:{type:Boolean,default:true}
        }
    },

    status:{
        type:String,
        enum:['active','archived'],
        default:'active'
    }
},{
    timestamps:true
})

WorkspaceSchema.index({name:'text'})
WorkspaceSchema.index({owner:1});
WorkspaceSchema.index({'members.user':1});

WorkspaceSchema.methods.isMember=function(userId){
    if(!userId){
        // console.log(`[isMember Check - ${this.name}] Failed: No userId provided.`)
        return false;
    }
    const userIdStr=userId.toString();
    if(this.owner.toString()===userIdStr){ 
        // console.log(`[isMember Check - ${this.name}] User ${userIdStr} is owner.`)
        return true;
    }
    const isMemberInArray=this.members.some(member=>
        member.user && member.user.toString()===userIdStr
    )
    // console.log(`[isMember Check - ${this.name}] User ${userIdStr} is member: ${isMemberInArray}`)

    return isMemberInArray;
}

WorkspaceSchema.methods.isAdmin=function(userId){
    return this.members.some(member=>
        member.user.toString()===userId.toString() &&
        member.role==='admin' &&
        member.status==='active'
    )
}

export default mongoose.model('Workspace',WorkspaceSchema);