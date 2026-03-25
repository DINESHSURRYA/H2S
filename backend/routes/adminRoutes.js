import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticateAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', adminController.login);
router.get('/ngos', authenticateAdmin, adminController.getAllNgos);
router.patch('/ngos/:id/verify', authenticateAdmin, adminController.verifyNgo);

export default router;
