import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticateAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', adminController.login);
router.get('/overview', authenticateAdmin, adminController.getOverview);
router.get('/ngos', authenticateAdmin, adminController.getAllNgos);
router.patch('/ngos/:id/verify', authenticateAdmin, adminController.verifyNgo);
router.get('/volunteers', authenticateAdmin, adminController.getAllVolunteers);
router.patch('/volunteers/:id/status', authenticateAdmin, adminController.updateVolunteerStatus);
router.get('/requests', authenticateAdmin, adminController.getAllRequests);

export default router;
