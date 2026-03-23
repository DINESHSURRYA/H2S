import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();

router.get('/', userController.getUser);

export default router;
