import jwt from "jsonwebtoken"

import { User } from "../models/user.model.js"

export const protectRoute = async(req,res,next)=>{
    try {
        const token = req.cookies.jwt
        if (!token){
            return res.status(404).json({message:"UnAuthorized - No token Provided"})
        }
        const isTokenCorrect = jwt.verify(token,process.env.JWT_SECRET)
        if(!isTokenCorrect){
            return res.status(400).json({message:"UnAuthorized - Invalid token"})
        }
        const user = await User.findById(isTokenCorrect.user_id).select("-password")
        if (!user){
            return res.status(400).json({message:"User not found"})
        }
        req.user = user 
        next()
    } catch (error) {
        console.log("Error in protected middleware ",error.message)
         res.status(500).json({message:"Internal server error"})
    }
}