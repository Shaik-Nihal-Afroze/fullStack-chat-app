import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";


export const useChatStore = create((set,get)=>({
    messages:[],
    users:[],
    selectedUser:null,
    isUsersLoading:false,
    isMessagesLoading:false,

    getUsers :async()=>{
        set({isUsersLoading:true})
        try {
            const res = await axiosInstance.get("/messages/users")
            set({users:res.data})
        } catch (error) {
            toast.error(error.response.data.message)
        }finally{
            set({isUsersLoading:false})
        }
    },

    getMessages:async(userId)=>{
        set({isMessagesLoading:true})
        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({messages:res.data})
        } catch (error) {
            toast.error(error.response.data.message)
        }
        finally{
            set({isMessagesLoading:false})
        }
    },

    sendMessage:async(messageData)=>{
        const {selectedUser,messages} = get()
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`,messageData)
            set({messages:[...messages,res.data]})
        } catch (error) {
            toast.error(error.response.data.message)
        }

    },
    subscribeToMessages :()=>{
        const {selectedUser} = get()
        if(!selectedUser) return ;
        
        const socket = useAuthStore.getState().socket;
        
        socket.on("newMessage",(newMessage)=>{
            const isMessageSendFromSelectedUser = newMessage.senderId ===selectedUser._id
            if(!isMessageSendFromSelectedUser) return ;
            set({messages:[...get().messages,newMessage]})
            
            
        })

    },

    unSubscribeFromMessages:()=>{
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage")
    },

    setSelectedUser:(selectedUser)=>set({selectedUser}),


}))