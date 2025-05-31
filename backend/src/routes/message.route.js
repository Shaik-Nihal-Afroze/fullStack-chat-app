import express from 'express'

import { protectRoute } from '../middleware/auth.middleware.js'
import { getAllMessages, getAllUsersForSidebar, sendMessage } from '../controllers/message.controller.js'
const router = express.Router()


router.get("/users",protectRoute,getAllUsersForSidebar)
router.get("/:id",protectRoute,getAllMessages)
router.post("/send/:id",protectRoute,sendMessage)

export default router