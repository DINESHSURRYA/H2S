import express from 'express';
import * as ngoController from '../controllers/ngoController.js';

const router = express.Router();

router.post('/register', ngoController.register);
router.post('/login', ngoController.login);
router.get('/:id/stats', ngoController.getStats);
router.get('/:id', ngoController.getProfile);

export default router;
