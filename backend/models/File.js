import mongoose from "mongoose";

const FileSchema=new mongoose.Schema({
    filename:{
        type:String,
        required:[true,'Filename is required'],
        trim:true,
    },
    url:{
        type:String,
        required:[true,'File URL is required'],
    },
    public_id:{
        type:String,
        required:[true,'Cloudinary public_id is required']
    },
    mimetype:{
        type:String,
    },
    size:{
        type:Number,
    },
    uploadedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    workspace:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Workspace',
        required:false
    },
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project',
        required:false
    }
},{
    timestamps:true
})

FileSchema.pre('save',function(next){ // This pre('save') middleware in Mongoose is a validation hook for the File schema.
    if(this.workspace && this.project){
        next(new Error('File cannot belong to both a workspace and a project.'))
    }
    if(!this.workspace && !this.project){
        next(new Error('File must belong to either a workspace or a project.'))
    }
    next()
})


export default mongoose.model('File',FileSchema)