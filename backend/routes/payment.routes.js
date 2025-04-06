import express from 'express'
import {protect} from '../middlewares/auth.js'
import {createOrder,verifyPayment} from '../controllers/paymentController.js'
import {check,validationResult} from 'express-validator'

const router=express.Router()

const validateCreateOrder=[
    check('planId','Plan ID is required.').notEmpty().trim(),
    (req,res,next)=>{
        const errors=validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        next()
    }
]

const validateVerifyPayment=[
    check('razorpay_order_id','Razorpay Order ID is required.').notEmpty().trim(),
    check('razorpay_payment_id','Razorpay Payment ID is required.').notEmpty().trim(),
    check('razorpay_signature','Razorpay Signature is required.').notEmpty().trim(),
    check('planId','Plan ID is required for verification context.').notEmpty().trim(),
    (req,res,next)=>{
        const errors=validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        next()
    }
]

router.post('/create-order',protect,validateCreateOrder,createOrder)
router.post('/verify-payment',protect,validateVerifyPayment,verifyPayment)

export default router