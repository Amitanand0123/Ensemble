import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import { setupSocketIO } from "../utils/socket.js"; // Correct named import


export const createTask=async(req,res)=>{
    try {
        const {title,description,project,workspace,assignedTo,status,priority,dueDate,tags,estimatedHours}=req.body

        if(!title || !project || !workspace){
            return res.status(400).json({
                success:false,
                message:'All fields are required'
            })
        }

        const projectDoc=await Project.findById(project);
        if(!projectDoc){
            return res.status(404).json({
                success:false,
                message:'Project not found'
            })
        }

        const task=new Task({
            title,
            description:description || '',
            project,
            workspace,
            assignedTo:assignedTo || [],
            status:status || 'todo',
            priority:priority || 'medium',
            dueDate:dueDate || null,
            tags:tags || [],
            estimatedHours:estimatedHours || 0,
            createdBy:req.user._id,
        })

        await task.save();
        const savedTask=await Task.findById(task._id)
            .populate('assignedTo','name email')
            .populate('createdBy','name email')
            
        res.status(201).json({
            success:true,
            task
        })


    } catch (error) {
        console.error('Create task error:',error);
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

        console.log('Filter:', filter);

        const tasks=await Task.find(filter)
            .populate('project','name')
            .populate('assignedTo','name email')
            .populate('createdBy','name email')
            .sort('-createdAt')

        console.log('Tasks:', tasks);
        

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
        if(!project.isMember(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'Not authorized to update this task'
            })
        }

        const allowedUpdates=['title','description','status','priority','assignedTo','dueDate','tags','project']
        const updates=Object.keys(req.body);
        console.log('Request Body:', req.body);
        const isValidOperation=updates.every(update=> allowedUpdates.includes(update))
        if(!isValidOperation){
            return res.status(400).json({
                success:false,
                message:'Invalid updates'
            })
        }

        updates.forEach(update=>task[update]=req.body[update]);
        await task.save();
        res.json({
            success:true,
            task
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

export const addTaskComment=async(req,res)=>{
    try {
        const task=await Task.findById(req.params.id);
        if(!task){
            return res.status(404).json({
                success:false,
                message:'Task not found'
            })
        }

        const comment={
            user:req.user._id,
            content:req.body.content
        }
        task.comments.unshift(comment);
        await task.save();

        res.status(201).json({
            success:true,
            comment:task.comments[0]
        })

    } catch (error) {
        console.error('Add comment error:',error)
        res.status(500).json({
            success:false,
            message:'Could not add comment',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}

export const addTaskDependeny=async(req,res)=>{
    try {
        const {taskId,dependencyId}=req.body;
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