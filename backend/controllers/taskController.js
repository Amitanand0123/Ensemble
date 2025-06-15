import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { uploadToCloud } from "../utils/fileUpload.js";

export const createTask=async(req,res)=>{
    try {
        const {title,description,project,workspace,assignedTo,status,priority,dueDate,tags,estimatedHours}=req.body

        if(!title || !project || !workspace){
            return res.status(400).json({
                success:false,
                message:'Title, project and workspace are required fields.'
            })
        }

        const projectDoc=await Project.findById(project);
        if(!projectDoc){
            return res.status(404).json({
                success:false,
                message:'Project not found'
            })
        }
        if(!projectDoc.isMember(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'Not authorized to create task in this project'
            })
        }
        let uploadedAttachments=[];
        if(req.files && req.files.length>0){
            uploadedAttachments=await Promise.all(
                req.files.map(async(file)=>{
                    try {
                        const result=await uploadToCloud(file.buffer,file.originalname);
                        return{
                            filename:file.originalname,
                            url:result.url,
                            public_id:result.public_id,
                            mimetype:file.mimetype,
                            size:file.size,
                            uploadedBy:req.user._id,
                            uploadedAt:new Date()
                        }
                    } catch (error) {
                        console.error(`Failed to upload attachment ${file.originalname}:`,error)
                        return null;
                    }
                })
            )
            uploadedAttachments=uploadedAttachments.filter(att=>att!==null);
        }
        let parsedAssignedTo=[];
        if(assignedTo){
            try {
                if(typeof assignedTo==='string' && assignedTo.startsWith('[')){
                    parsedAssignedTo=JSON.parse(assignedTo);
                }
                else if(Array.isArray(assignedTo)){
                    parsedAssignedTo=assignedTo;
                }
                else if(typeof assignedTo==='string'){
                    parsedAssignedTo=[assignedTo];
                }
            } catch (error) {
                console.error('Error parsing assignedTo:',error);
            }
        }
        let parsedTags=[];
        if(tags){
            try {
                if(typeof tags==='string' && tags.startsWith('[')){
                    parsedTags=JSON.parse(tags);
                }
                else if(Array.isArray(tags)){
                    parsedTags=tags;
                }
                else if(typeof tags==='string'){
                    parsedTags=tags.split(',').map(t=>t.trim()).filter(t=>t);
                }
            } catch (error) {
                console.error('Error parsing tags:',error);
            }
        }

        const task=new Task({
            title,
            description:description || '',
            project,
            workspace,
            assignedTo:parsedAssignedTo,
            tags:parsedTags,
            status:status || 'todo',
            priority:priority || 'medium',
            dueDate:dueDate || null,
            estimatedHours:estimatedHours || 0,
            createdBy:req.user._id,
            attachments:uploadedAttachments
        })

        await task.save();
        const savedTask=await Task.findById(task._id)
            .populate('assignedTo','name email avatar')
            .populate('createdBy','name email avatar')
            .populate('attachments.uploadedBy','name email avatar')
            
        res.status(201).json({
            success:true,
            task:savedTask
        })


    } catch (error) {
        console.error('Create task error:',error);
        if(error.name==='ValidationError'){
            return res.status(400).json({
                success:false,
                message:error.message
            })
        }
        res.status(500).json({
            success:false,
            message:'Could not create task',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}

export const getTasks=async(req,res)=>{
    try {
        const {project,status,assignedTo}=req.query;

        const currentWorkspace=req.user.workspaces?.[0]?.workspace
        if(!currentWorkspace){
            return res.status(400).json({
                success:false,
                message:'Current workspace not found for the user'
            })
        }

        const filter={
            workspace:currentWorkspace
        }

        if(project) filter.project=project;
        if(status) filter.status=status;
        if(assignedTo) filter.assignedTo=assignedTo;


        const tasks=await Task.find(filter)
            .populate('project','name')
            .populate('assignedTo','name email')
            .populate('createdBy','name email')
            .sort('-createdAt')
        
        res.json({
            success:true,
            count:tasks.length,
            tasks
        })


    } catch (error) {
        console.error('Get tasks error:',error);
        res.status(500).json({
            success:false,
            message:'Could not fetch tasks',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}

export const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('project', 'name')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            task
        });

    } catch (error) {
        console.error('Get task by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Could not fetch task',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


export const updateTask=async(req,res)=>{
    try {
        const task=await Task.findById(req.params.id);
        if(!task){
            return res.status(404).json({
                success:false,
                message:'Task not found'
            })
        }

        const project=await Project.findById(task.project);
        if(!project){
            return res.status(404).json({
                success:false,
                message:'Associated Project not found'
            })
        }
        if(!project.isMember(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'Not authorized to update this task'
            })
        }

        const allowedUpdates=['title','description','status','priority','assignedTo','dueDate','tags','estimatedHours'];
        const updates=Object.keys(req.body);
        const isValidOperation=updates.every(update=> allowedUpdates.includes(update))
        if(!isValidOperation){
            const invalidFields=updates.filter(update=> !allowedUpdates.includes(update))
            return res.status(400).json({
                success:false,
                message:`Invalid updates! Cannot update fields: ${invalidFields.join(', ')}`
            })
        }

        updates.forEach(update=>{
            let value=req.body[update]
            if((update==='assignedTo' || update==='tags') && typeof value==='string'){
                try {
                    value=JSON.parse(value)
                } catch (error) {
                    console.error('Update task error:',error);
                    if(update==='tags'){
                        value=value.split(',').map(t=>t.trim()).filter(t=>t)
                    }
                    else value=[value]
                }
            }
            else if(update==='assignedTo' && !Array.isArray(value) && value){
                value=[value]
            }
            task[update]=value
        })
        await task.save();
        const updatedPopulatedTask=await Task.findById(task._id)
            .populate('assignedTo','name email avatar')
            .populate('createdBy','name email avatar')
            .populate('attachments.uploadedBy','name email avatar')
        res.json({
            success:true,
            task:updatedPopulatedTask
        })

    } catch (error) {
        console.error('Update task error:',error);
        res.status(500).json({
            success:false,
            message:'Could not update task',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}

export const deleteTask=async(req,res)=>{
    try {
        const task=await Task.findById(req.params.id);
        if(!task){
            return res.status(404).json({
                success:false,
                message:'Task not found'
            })
        }
        const project=await Project.findById(task.project);
        if(!project.isMember(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'Not authorized to delete this task'
            })
        }

        await task.deleteOne();
        res.json({
            success:true,
            message:'Task deleted successfully'
        })
    } catch (error) {
        console.error('Delete task error:',error)
        res.status(500).json({
            success:false,
            message:'Could not delete task',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}

export const addTaskAttachment=async(req,res)=>{
    try {
        const taskId=req.params.id;
        const task=await Task.findById(taskId)
        if(!task){
            return res.status(404).json({
                success:false,
                message:'Task not found'
            })
        }
        const project=await Project.findById(task.project);
        if(!project){
            return res.status(404).json({
                success:false,
                message:'Associated Project not found'
            })
        }
        if(!project.isMember(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'Not authorized to add attachments to this task'
            })
        }
        if(!req.files || req.files.length===0){
            return res.status(400).json({
                success:false,
                message:'No files uploaded'
            })
        }
        const newAttachments=await Promise.all(
            req.files.map(async (file)=>{
                try {
                    const result=await uploadToCloud(file.buffer,file.originalname);
                    return{
                        filename:file.originalname,
                        url:result.url,
                        public_id:result.public_id,
                        mimetype:file.mimetype,
                        size:file.size,
                        uploadedBy:req.user._id,
                        uploadedAt:new Date()
                    }
                } catch (error) {
                    console.error(`Failed to upload attachment ${file.originalname} for task ${taskId}:`,error)
                    return null;
                }
            })
        )
        const successfullyUploaded=newAttachments.filter(att=>att!==null);
        if(successfullyUploaded.length===0){
            return res.status(500).json({
                success:false,
                message:'Failed to upload any files.'
            })
        }
        task.attachments.push(...successfullyUploaded)
        await task.save();
        const updatedPopulatedTask=await Task.findById(taskId)
            .populate('assignedTo','name email avatar')
            .populate('createdBy','name email avatar')
            .populate('attachments.uploadedBy','name email avatar')
        
        res.status(200).json({
            success:true,
            message:`${successfullyUploaded.length} file(s) added successfully.`,
            task:updatedPopulatedTask
        })

    } catch (error) {
        console.error('Add task attachments error:',error)
        if(error.name==='ValidaionError'){
            return res.status(400).json({
                success:false,
                message:error.message
            })
        }
        res.status(500).json({
            success:false,
            message:'Could not add attachments',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}
export const addTaskComment=async(req,res)=>{
    try {
        const taskId=req.params.id;
        const task=await Task.findById(taskId);
        if(!task){
            return res.status(404).json({
                success:false,
                message:'Task not found'
            })
        }
        const project=await Project.findById(task.project);
        if(!project){
            return res.status(404).json({
                success:false,
                message:'Associated Project not found'
            })
        }
        if(!project.isMember(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'Not authorized to add comments to this task'
            })
        }
        const {content}=req.body;
        if(!content || !content.trim()){
            return res.status(400).json({
                success:false,
                message:'Comment content cannot be empty'
            })
        }

        const comment={
            user:req.user._id,
            content:content.trim(),
            createdAt:new Date()
        }
        task.comments.unshift(comment);
        await task.save();
        await task.populate('comments.user','name email avatar')
        const newComment=task.comments[0];

        res.status(201).json({
            success:true,
            comment:newComment
        })

    } catch (error) {
        console.error('Add comment error:',error)
        if(error.name==='ValidaionError'){
            return res.status(400).json({
                success:false,
                message:error.message
            })
        }
        res.status(500).json({
            success:false,
            message:'Could not add comment',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}

export const addTaskDependeny=async(req,res)=>{
    try {
        const {dependencyId}=req.body;
        const task=await Task.findById(req.params.id)
        
        if(!task){
            return res.status(404).json({success:false,message:'Task not found'})
        }
        const dependency=await Task.findById(dependencyId);
        if(!dependency){
            return res.status(404).json({success:false,message:'Dependency task not found'})
        }
        if(task.dependencies.includes(dependencyId)){
            return res.status(400).json({success:false,message:'Dependency already exists'})
        }
        task.dependencies.push(dependencyId)
        await task.save();
        res.json({success:true,message:'Dependency added successfully',task})

    } catch (error) {
        console.error('Add task dependency error:',error)
        res.status(500).json({success:false,message:'Could not add dependency',error:process.env.NODE_ENV==='development'?error.message:undefined})
    }
}

export const getTasksbyProject=async(req,res)=>{
    try {
        const {projectId}=req.params;
        const {status,priority,assignedTo,search}=req.query
        const project=await Project.findById(projectId)
        if(!project){
            return res.status(404).json({
                success:false,
                message:'Project not found'
            })
        }
        if(!project.isMember(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'Not authorized to view tasks in this project'
            })
        }
        const filter={project:projectId}
        if(status) filter.status=status;
        if(priority) filter.priority=priority;
        if(assignedTo) filter['assignedTo.user']=assignedTo
        if(search){
            filter.$or=[
                {title:{$regex:search,$options:'i'}},
                {description:{$regex:search,$options:'i'}}
            ]
        }

        const tasks=await Task.find(filter)
            .populate('assignedTo.user','name email avatar')
            .populate('createdBy','name email avatar')
            .populate('comments.user','name email avatar')
            .sort({createdAt:-1})

        res.json({
            success:true,
            tasks:tasks,
            count:tasks.length
        })

    } catch (error) {
        console.error('Get tasks by project error:',error);
        res.status(500).json({
            success:false,
            message:'Could not fetch tasks',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        }) 
    }
}