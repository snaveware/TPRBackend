const RequestHandler = require('../RequestHandler')
const Logger = require('../Logger')
const {verify} = require('jsonwebtoken')
const {sysConfig} = require('../config')
const {Account} = require('../models')


async function authenticate(req){


    Logger.info('extracting bearer token')
    let bearerToken = req.headers.authorization;

    if(!bearerToken){
        RequestHandler.throwError(401,'You must provide an access token')()
    }

    bearerToken = bearerToken.trim()

    if(!bearerToken.startsWith('Bearer ')){
        RequestHandler.throwError(400, 'Wrong configuration of the access token')()
    }

    const token = bearerToken.split(' ').pop()

    Logger.info('verifying access token')

    try {
        const extracted = verify(token,sysConfig.JWT_ACCESS_SECRET)
        
        req.auth = await Account.findById(extracted._id)

        if(!req.auth){
            RequestHandler.throwError(401, 'Invalid access token','account not found')()
        }

    } catch (error) {
        
        RequestHandler.throwError(401, 'Invalid access token')()
    }

}

async function authMiddleware(req,res,next){
    
   try {
       await authenticate(req)
       next()
   } catch (error) {
    RequestHandler.sendError(req.requestId, res, error) 
   }
  
}

async function  optionalAuthMiddleware(req,res,next){    
    
    try {
        let bearerToken = req.headers.authorization;
        if(bearerToken){
            await authenticate(req)
        }  
        next()
    } catch (error) {
        
        Logger.warn(`authentication failed in optional authentication middleware. error: ${error}`)
        next()
    }
    
}



module.exports = {authMiddleware,optionalAuthMiddleware}