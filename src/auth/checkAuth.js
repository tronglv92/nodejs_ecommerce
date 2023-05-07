'use strict'

const HEADER={
    API_KEY:'x-api-key',
    AUTHORIZATION:'authorization'
}

const { ForbiddenRequestError } = require('../core/error.response')
const {findById}=require('../services/apikey.service')

const apiKey=async(req,res,next)=>{
    
        const key=req.headers[HEADER.API_KEY]?.toString()
        if(!key){
            throw new ForbiddenRequestError("Forbidden Error 1");
            
        }
        // check objKey
        const objKey=await findById(key)
        if(!objKey){
            throw new ForbiddenRequestError("Forbidden Error 2");
           
        }
        req.objKey=objKey
        return next()
    
}

const permission=(permission)=>{
    return (req,res,next)=>{
        if(!req.objKey.permissions){
            
            return res.status(403).json({
              message: "permission denied",
            });
        }

        console.log('permissions::',req.objKey.permissions)
        const validPermission=req.objKey.permissions.includes(permission)
        if(!validPermission){
            return res.status(403).json({
                message:'permission denied'
            })
        }
        return next()
    }
}


module.exports = {
  apiKey,
  permission,
  
};