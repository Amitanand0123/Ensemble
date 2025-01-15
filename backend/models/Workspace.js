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
WorkspaceSchema.index({'settings.inviteCode':1},{unique:true,sparse:true})

export default mongoose.model('Workspace',WorkspaceSchema);