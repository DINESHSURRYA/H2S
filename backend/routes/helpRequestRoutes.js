import express from 'express';
import * as helpRequestController from '../controllers/helpRequestController.js';

const router = express.Router();

// Public & aggregate routes (defined before parameterized /:id routes)
router.get('/stats', helpRequestController.getPlatformStats);
router.get('/track/:id', helpRequestController.trackRequest);
router.post('/create', helpRequestController.createRequest);
router.get('/pending', helpRequestController.getPendingRequests);
router.get('/unapproved', helpRequestController.getUnapprovedRequests);
router.get('/approved', helpRequestController.getApprovedRequests);
router.get('/volunteer/:volunteerId', helpRequestController.getVolunteerRequests);

// Request lifecycle & coordination routes
router.put('/:id/approve', helpRequestController.approveRequest);
router.put('/:id/resolve', helpRequestController.resolveRequest);
router.post('/:id/hype', helpRequestController.voteHype);
router.post('/:id/assign/:roleId', helpRequestController.assignToRole);
router.post('/:id/unassign/:roleId', helpRequestController.unassignFromRole);
router.put('/:id', helpRequestController.editRequest);

export default router;
