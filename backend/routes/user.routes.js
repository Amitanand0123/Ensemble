import express from 'express';
import { protect } from '../middlewares/auth.js';
import {adminProtect} from '../middlewares/adminAuth.js'
import {getAllUsers,updateUserRole} from '../controllers/userController.js'

const router=express.Router()

router.get('/',protect,adminProtect,getAllUsers)
router.patch('/:userId/role',protect,adminProtect,getAllUsers);
router.patch('/:userId/role',protect,adminProtect,updateUserRole)
export default router;