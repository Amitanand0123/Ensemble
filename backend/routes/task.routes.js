import express from 'express'
import {protect} from '../middlewares/auth.js'
import {createTask,getTasks,getTaskById,updateTask,deleteTask, addTaskComment} from '../controllers/taskController.js'
import {check,validationResult} from 'express-validator'
import multer from 'multer'

const router=express.Router()
const upload=multer({storage:multer.memoryStorage()})

router.use(protect)

const validateTask=[
    check('title')
        .trim()
        .notEmpty()
        .withMessage('Task title is required')
        .isLength({max:200})
        .withMessage('Task title cannot exceed 200 characters'),
    check('description')
        .optional()
        .isLength({max:1000})
        .withMessage('Description cannot exceed 1000 characters'),
    check('project')
        .notEmpty()
        .withMessage('Project is required'),
    (req,res,next)=>{
        const errors=validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        next()
    }
]

router.route('/')
    .post(upload.array('attachments'),validateTask,createTask)
    .get(getTasks)

router.route('/:id')
    .patch(validateTask,updateTask)
    .delete(deleteTask)
    .get(getTaskById)

router.post('/:id/comments',
    check('content')
        .trim()
        .notEmpty()
        .withMessage('Comment content is required'),
    addTaskComment
)

export default router;
