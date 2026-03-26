import express from 'express';
import { grantHelp, getGrantsByNGO, updateGrantStatus } from '../controllers/grantedHelpController.js';

const router = express.Router();

router.post('/', grantHelp);
router.get('/ngo/:ngoId', getGrantsByNGO);
router.patch('/:id/status', updateGrantStatus);

export default router;
