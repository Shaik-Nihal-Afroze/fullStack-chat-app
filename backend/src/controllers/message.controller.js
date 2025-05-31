import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
export const getAllUsersForSidebar = async(req,res)=>{
    try {
        const loggedInUser = req.user._id
        const getAllUsers = await User.find({_id:{$ne:loggedInUser}}).select("-password")
        res.status(200).json(getAllUsers)
        
    } catch (error) {
        console.log(`Error in getAllUsersForSidebar controller`,error.message);
        res.status(500).json({message:"Internal Server Error"})
    }
}


export const getAllMessages = async(req,res)=>{
    try {
        const {id:userToChatId} = req.params 
        const myId = req.user._id 
        const getMessages = await Message.find({
            $or:[
                {senderId:userToChatId,receiverId:myId},
                {senderId:myId,receiverId:userToChatId}
            ]
        })
        res.status(200).json(getMessages)
    } catch (error) {
        console.log(`Error in getAllMessages controller`,error.message);
        res.status(500).json({message:"Internal Server Error"})
    }
}

export const sendMessage= async(req,res)=>{
    try {
        const {text,image} = req.body;
        const {id:receiverId} = req.params;
        const senderId = req.user._id;
        let imageUrl;
       if (image){
        const sendingImage = await cloudinary.uploader.upload(image)
        
        imageUrl = sendingImage.secure_url
       }
       let newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
       })
       await newMessage.save()

        //  realtime chat functionality will be implemented by socket.io here
       const receiverSocketId = getReceiverSocketId(receiverId)
       if (receiverSocketId){
        io.to(receiverSocketId).emit("newMessage",newMessage)
       }
       

        
       res.status(201).json(newMessage)
       
    } catch (error) {
        console.log(`Error in sendMessage controller`,error);
        res.status(500).json({message:"Internal Server Error"})
    }
}