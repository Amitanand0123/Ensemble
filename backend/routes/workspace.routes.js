import express from 'express'
import {protect} from '../middlewares/auth.js'
import {createWorkspace,getWorkspaces,getWorkspaceById,joinWorkspace,updateWorkspaceSettings} from '../controllers/workspaceController.js'
import {check,validationResult} from 'express-validator'

const router=express.Router();

router.use(protect);

const validateWorkspace=[
    check('name')
        .trim()
        .notEmpty()
        .withMessage('Workspace name is required')
        .isLength({max:50})
        .withMessage('Name cannot be more than 50 characters'),
    check('description')
        .optional()
        .isLength({max:500})
        .withMessage('Description cannot be more than 500 characters'),
    (req,res,next)=>{
        const errors=validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        next()
    }
]

router.route('/')
    .post(createWorkspace)
    .get(getWorkspaces)

router.route('/:id')
    .get(getWorkspaceById)
    .patch(validateWorkspace,updateWorkspaceSettings);

router.post('/join',[
    check('inviteCode')
        .notEmpty()
        .withMessage('Invite code is required')
],joinWorkspace)

export default router;
 
