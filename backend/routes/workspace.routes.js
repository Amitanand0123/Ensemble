import express from 'express'
import {protect} from '../middlewares/auth.js'
import {createWorkspace,getWorkspaces,getWorkspaceById} from '../controllers/workspaceController.js'

const router=express.Router();

router.use(protect);

router.route('/')
    .post(createWorkspace)
    .get(getWorkspaces)

router.route('/:id')
    .get(getWorkspaceById);

export default router;
 
