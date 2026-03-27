import express from 'express';
import * as volunteerController from '../controllers/volunteerController.js';
import { authenticateNgo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', volunteerController.register);
router.post('/login', volunteerController.login);
router.get('/unverified', authenticateNgo, volunteerController.getUnverifiedVolunteers);
router.post('/verify-skill', authenticateNgo, volunteerController.verifySkill);
router.get('/:id', volunteerController.getProfile);
router.put('/:id', volunteerController.updateProfile);

export default router;
