import { generateToken } from "../lib/utils.js"
import { User } from "../models/user.model.js"
import bcrypt from 'bcryptjs'
import cloudinary from "../lib/cloudinary.js"
export const signup = async(req,res)=>{
    try {
        const {fullName,email,password} = req.body 
        if (!fullName || !email || !password){
            return res.status(400).json({message:"All fields are required"})
        }
        if (password<6){
            return res.status(400).json({message:"Password must be atleast of 6 characters"}) 
        }

        const user = await User.findOne({email})
        if (user){
            return res.status(400).json({message:"User already exist"}) 
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        const newUser = new User({
            
            fullName,
            email,
            password:hashedPassword
        })
        if (newUser){
            generateToken(newUser._id,res)

            await newUser.save()
            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic

            })
           
        }
        else{
            res.status(400).json({message:"Invalid user details"})
        }
        
         
      
    } catch (error) {
        console.log("Error in auth controller ",error.message)
        res.status(500).json({message:`${error.message}`})
    }
}

export const login = async(req,res)=>{
    try {
        const {email,password} = req.body

        if (!email){
            return res.status(400).json({message:"Invalid Credential"})
        }

        const user = await User.findOne({email})

        if (!user){
            return res.status(400).json("User not found")
        }

        const isPasswordCorrect = await bcrypt.compare(password,user.password)

        if (!isPasswordCorrect){
             return res.status(400).json({message:"Invalid Credential"})
        }

        generateToken(user._id,res)

        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic
        })
    } catch (error) {
         console.log("Error in login controller ",error.message)
         res.status(500).json({message:"Internal server error"})
    }
}

export const logout = (req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged out successfully"})
    } catch (error) {
         console.log("Error in logout controller ",error.message)
         res.status(500).json({message:"Internal server error"})
    }
}

// export const details = (req,res)=>{
    
//      try{
//         res.send("protected route is working properly")
//     }catch(error){
//         console.log(`Error is auth controller`,error.message);
//         res.status(500).json({message:"Internal Server Error"})
//     }
// }

export const updateProfile = async(req,res)=>{
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;
        if (!profilePic){
            return res.status(500).json({message:"Internal server error"})
        }

        const uploadingImage = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadingImage.secure_url},{new:true})

        res.status(200).json(updatedUser)

    } catch (error) {
        console.log(`Error in update profile controller`,error.message);
        res.status(500).json({message:"Internal Server Error"})
    }
}

export const checkAuth  = (req,res)=>{
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log(`Error in check auth controller`,error.message);
        res.status(500).json({message:"Internal Server Error"})
    }
}