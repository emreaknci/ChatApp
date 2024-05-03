import express from 'express';
import { checkToken, getCurrentUser, login, register } from '../controllers/authController';
import AuthMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/checkToken", AuthMiddleware, checkToken);
router.get("/getCurrentUser", AuthMiddleware, getCurrentUser)


export default router;