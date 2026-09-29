import express from "express"
import { createConversation, getConversations, getMessages, saveMessage, updateConversation } from "../controllers/chat.controller.js"

const router = express.Router()

router.get("/create-conversation", createConversation)
router.get("/get-conversations" , getConversations)
router.post("/update-conversation", updateConversation)  //post because we are bringing data from frontend in its controller
router.post("/save-message", saveMessage)   //post bcoz we are bringing data from frontend in the controller
router.get("/get-messages/:conversationId",getMessages)

export default router;