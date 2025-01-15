const errorHandler = (err,req,res,next)=>{
    console.log(err.stack);

    if(err.name==='ValidationError'){
        const messages=Object.values(err.errors).map(val=>val.message);
        return res.status(400).json({
            success:false,
            error:messages
        })
    }

    if(err.code===11000){ //Indicates a MongoDB error when attempting to insert a duplicate key
        return res.status(400).json({
            success:false,
            error:'Duplicate field value entered'
        })
    }

    if(err.name==='JsonWebTokenEror'){
        return res.status(401).json({
            success:false,
            error:'Invalid token'
        })
    }
    res.status(err.statusCode || 500).json({
        success:false,
        error:err.message || 'Server Error'
    })
}

export default errorHandler;