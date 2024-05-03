import express from 'express';
import { createMessage, getChatMessages } from '../controllers/messageController';
import AuthMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.post("/", AuthMiddleware, createMessage);
router.get("/:chatId", AuthMiddleware, getChatMessages)

export default router;