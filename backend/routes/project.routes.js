import express from 'express'
import {protect} from '../middlewares/auth.js'
import { createProject,getProjects,getProjectById,updateProject,deleteProject, getProjectByWorkspaceId,inviteToProject,removeMemberFromProject,
    updateMemberRoleInProject
 } from '../controllers/projectController.js'
import {check,validationResult} from 'express-validator'
import {uploadProjectFile,getProjectFiles } from '../controllers/fileController.js'
import multer from 'multer'

const router=express.Router();
const upload=multer({storage:multer.memoryStorage(),limits:{
    fileSize:10*1024*1024
}})
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
    .post(protect,validateProject,createProject)
    .get(protect,getProjects);

router.route('/:id')
    .get(protect,getProjectById)   
    .patch(protect,validateProject,updateProject)
    .delete(protect,deleteProject);



router.get('/workspace/:workspaceId/projects',protect,getProjectByWorkspaceId)

router.route('/:projectId/files')
    .get(protect,getProjectFiles)
    .post(protect,upload.array('projectFiles',10),uploadProjectFile)


router.post('/:projectId/members/invite', protect, inviteToProject);
router.patch('/:projectId/members/:memberUserId/role',protect,updateMemberRoleInProject)
router.delete('/:projectId/members/:memberUserId',protect,removeMemberFromProject)

export default router;