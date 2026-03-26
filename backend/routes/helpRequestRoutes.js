import express from 'express';
import * as helpRequestController from '../controllers/helpRequestController.js';

const router = express.Router();

router.post('/create', helpRequestController.createRequest);
router.get('/pending', helpRequestController.getPendingRequests);
router.get('/volunteer/:volunteerId', helpRequestController.getVolunteerRequests);
router.put('/:id/approve', helpRequestController.approveRequest);
router.post('/:id/hype', helpRequestController.voteHype);
router.post('/:id/lock', helpRequestController.toggleLock);
// routes
router.get('/unapproved', helpRequestController.getUnapprovedRequests);
router.get('/approved', helpRequestController.getApprovedRequests);

export default router;


