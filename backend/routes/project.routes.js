import express from 'express'
import {protect} from '../middlewares/auth.js'
import { createProject,getProjects,getProjectById,updateProject,deleteProject, getProjectByWorkspaceId } from '../controllers/projectController.js'
import {check,validationResult} from 'express-validator'

const router=express.Router();
router.use(protect)

const validateProject=[
    check('name')
        .trim()
        .notEmpty()
        .withMessage('Project name is required')
        .isLength({max:100})
        .withMessage('Project name cannot exceed 100 characters'),
    check('description')
        .optional()
        .isLength({max:1000})
        .withMessage('Description cannot exceed 1000 characters'),
    (req,res,next)=>{
        const errors=validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        next()
    }
]

router.route('/')
    .post(validateProject,createProject)
    .get(getProjects);

router.route('/:id')
    .get(getProjectById)   
    .patch(validateProject,updateProject)
    .delete(deleteProject);

router.get('/workspace/:workspaceId/projects',getProjectByWorkspaceId)

export default router;