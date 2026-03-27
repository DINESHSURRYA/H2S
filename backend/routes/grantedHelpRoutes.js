import express from 'express';
import { grantHelp, getGrantsByNGO, updateGrantStatus, markAsReceived } from '../controllers/grantedHelpController.js';

const router = express.Router();

router.post('/', grantHelp);
router.get('/ngo/:ngoId', getGrantsByNGO);
router.patch('/:id/status', updateGrantStatus);
router.post('/:id/received', markAsReceived);

export default router;
