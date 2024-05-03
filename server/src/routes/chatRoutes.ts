import express from 'express';
import { addNewUsersToGroup, createChat, getChatWithMessages, getCurrentUserChats, getUserChats } from '../controllers/chatController';
import AuthMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.post("/", AuthMiddleware, createChat);
router.post("/add-new-usesr-to-group", AuthMiddleware, addNewUsersToGroup);
router.get("/", AuthMiddleware, getCurrentUserChats);
router.get("/:userId", getUserChats);
router.get("/get-chat-with-messages/:chatId", AuthMiddleware, getChatWithMessages);

export default router;