import express from 'express';
import * as volunteerController from '../controllers/volunteerController.js';

const router = express.Router();

router.post('/register', volunteerController.register);
router.post('/login', volunteerController.login);

export default router;
