import express from 'express';
import * as helpRequestController from '../controllers/helpRequestController.js';

const router = express.Router();

router.post('/create', helpRequestController.createRequest);
router.get('/pending', helpRequestController.getPendingRequests);
router.get('/volunteer/:volunteerId', helpRequestController.getVolunteerRequests);
router.get('/volunteer/:volunteerId/raised', helpRequestController.getVolunteerRaisedRequests);
router.put('/:id/approve', helpRequestController.approveRequest);


export default router;
