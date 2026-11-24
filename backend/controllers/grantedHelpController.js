import mongoose from 'mongoose';
import grantedHelpRepository from '../repository/grantedHelpRepository.js';
import helpRequestRepository from '../repository/helpRequestRepository.js';
import ngoRepository from '../repository/ngoRepository.js';
import helpRequestService from '../services/helpRequestService.js';

export const grantHelp = async (req, res, next) => {
  try {
    const { quantityApproved, ngoId, requirementId, helpRequestId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(ngoId) ||
      !mongoose.Types.ObjectId.isValid(requirementId) ||
      !mongoose.Types.ObjectId.isValid(helpRequestId)
    ) {
      return res.status(400).json({ message: 'Valid NGO, Help Request, and Requirement IDs are required.' });
    }

    const [ngo, helpRequest, existingGrants] = await Promise.all([
      ngoRepository.findNgoById(ngoId),
      helpRequestRepository.getHelpRequestById(helpRequestId),
      grantedHelpRepository.findByRequestAndRequirement(helpRequestId, requirementId),
    ]);

    if (!ngo) {
      return res.status(404).json({ message: 'NGO account not found.' });
    }
    if (ngo.status === 'suspended') {
      return res.status(403).json({ message: 'Suspended NGOs cannot allocate resources.' });
    }
    if (ngo.status === 'pending') {
      return res.status(403).json({
        message: 'Your NGO is pending Admin verification. An Admin must approve your account at /admin before you can allocate supplies.',
      });
    }
    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found.' });
    }

    const reqItem = helpRequest.requirements.find((r) => r._id.toString() === requirementId.toString());
    const validation = helpRequestService.validateGrantAllocation(
      reqItem,
      existingGrants,
      ngoId,
      quantityApproved
    );

    if (!validation.valid) {
      return res.status(400).json({ message: validation.reason });
    }

    const newGrant = await grantedHelpRepository.createGrant({
      quantityApproved: validation.safeQty,
      ngoId,
      requirementId,
      helpRequestId,
      status: 'pending',
    });

    await helpRequestRepository.pushGrantToRequirement(helpRequestId, requirementId, newGrant._id);
    await ngoRepository.incrementTrustScore(ngoId, 15);

    res.status(201).json({
      message: 'Help allocated successfully',
      grant: newGrant,
    });
  } catch (error) {
    next(error);
  }
};

export const getGrantsByNGO = async (req, res, next) => {
  try {
    const { ngoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(ngoId)) {
      return res.status(400).json({ message: 'Invalid NGO ID.' });
    }

    const grants = await grantedHelpRepository.getGrantedHelpByNGO(ngoId);
    res.status(200).json(grants);
  } catch (error) {
    next(error);
  }
};

export const updateGrantStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'fulfilled', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status must be pending, fulfilled, or cancelled.' });
    }

    const updatedGrant = await grantedHelpRepository.updateGrantedHelpStatus(id, status);
    if (!updatedGrant) {
      return res.status(404).json({ message: 'Grant record not found.' });
    }

    res.status(200).json({
      message: `Grant status updated to ${status}`,
      grant: updatedGrant,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsReceived = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid grant ID.' });
    }

    const updatedGrant = await grantedHelpRepository.markAsReceived(id);
    if (!updatedGrant) {
      return res.status(404).json({ message: 'Grant record not found.' });
    }

    // Dynamic Trust Score: reward NGO on verified field delivery
    if (updatedGrant.ngoId) {
      await ngoRepository.incrementTrustScore(updatedGrant.ngoId, 10);
    }

    // Check if the entire help request is now fully received -> auto-resolve
    let autoResolved = false;
    if (updatedGrant.helpRequestId) {
      const parentRequest = await helpRequestRepository.getHelpRequestById(updatedGrant.helpRequestId);
      if (parentRequest) {
        const summary = helpRequestService.calculateFulfillmentSummary(parentRequest);
        if (summary.isFullyReceived && parentRequest.status !== 'resolved') {
          await helpRequestRepository.updateHelpRequestStatus(parentRequest._id, 'resolved');
          autoResolved = true;
        }
      }
    }

    res.status(200).json({
      message: autoResolved
        ? 'Delivery confirmed! All supplies received — mission automatically resolved.'
        : 'Supply delivery confirmed!',
      grant: updatedGrant,
      autoResolved,
    });
  } catch (error) {
    next(error);
  }
};
