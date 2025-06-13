import express from 'express'
import {protect} from '../middlewares/auth.js'
import {createTask,getTasks,getTaskById,updateTask,deleteTask, addTaskComment, getTasksbyProject,addTaskAttachment} from '../controllers/taskController.js'
import {check,validationResult} from 'express-validator'
import multer from 'multer'

const router=express.Router()
const upload=multer({storage:multer.memoryStorage()})

router.use(protect)

const validateTaskOnCreate=[
    check('title')
        .trim()
        .notEmpty()
        .withMessage('Task title is required')
        .isLength({max:200})
        .withMessage('Task title cannot exceed 200 characters'),
    check('project')
        .notEmpty()
        .withMessage('Project is required'),
    check('workspace')
        .notEmpty()
        .withMessage('Workspace is required'),
    (req,res,next)=>{
        const errors=validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                success:false,
                message:errors.array()[0].msg
            })
        }
        next()
    }
]

router.route('/')
    .post(upload.array('attachments'),validateTaskOnCreate,createTask)
    .get(getTasks)

router.route('/:id')
    .patch(updateTask)
    .delete(deleteTask)
    .get(getTaskById)

router.post('/:id/comments',
    [
        check('comment')
            .trim()
            .notEmpty()
            .withMessage('Comment is required')
    ],
    (req,res,next)=>{
        const errors=validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                success:false,
                message:errors.array()[0].msg
            })
        }   
    },
    addTaskComment
)
router.post('/:id/attachments',upload.array('newAttachments',5),addTaskAttachment)

router.get('/project/:projectId/tasks',getTasksbyProject)

export default router;