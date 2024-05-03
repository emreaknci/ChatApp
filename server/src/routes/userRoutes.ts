import express from 'express';
import {  editUserInfo, getAllUsers, getUserById } from '../controllers/userController';
import AuthMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.post("/editUserInfo", AuthMiddleware, editUserInfo);
router.get("/getAllUsers", getAllUsers);
router.get("/getUserById/:id", getUserById);


export default router;