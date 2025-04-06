import express from 'express'
import {protect} from '../middlewares/auth.js'
import {createWorkspace,getWorkspaces,getWorkspaceById,joinWorkspace,updateWorkspaceSettings,inviteToWorkspace,removeMemberFromWorkspace,updateMemberRoleInWorkspace, deleteWorkspace} from '../controllers/workspaceController.js'
import {check,validationResult} from 'express-validator'
import { uploadWorkspaceFile,getWorkspaceFiles } from '../controllers/fileController.js'
import multer from 'multer'

const router=express.Router();
const upload=multer({storage:multer.memoryStorage(),limits:{
    fileSize:10*1024*1024
}})

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
    .post(protect,validateWorkspace,createWorkspace)
    .get(protect,getWorkspaces)

router.route('/:id')
    .get(protect,getWorkspaceById)
    .patch(protect,validateWorkspace,updateWorkspaceSettings)
    .delete(protect,deleteWorkspace)

router.post('/join',protect,[
    check('inviteCode') 
        .notEmpty()
        .withMessage('Invite code is required')
],(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    next();
},joinWorkspace)

router.route('/:workspaceId/files')
    .get(protect,getWorkspaceFiles)
    .post(protect,upload.array('workspaceFiles',10),uploadWorkspaceFile)

router.post('/:workspaceId/members/invite',protect,inviteToWorkspace);
router.patch('/:workspaceId/members/:memberUserId/role',protect,updateMemberRoleInWorkspace);
router.delete('/:workspaceId/members/:memberUserId',protect,removeMemberFromWorkspace);

    

export default router;
 
