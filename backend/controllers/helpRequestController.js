import mongoose from 'mongoose';
import helpRequestRepository from '../repository/helpRequestRepository.js';
import publicUserRepository from '../repository/publicUserRepository.js';
import volunteerRepository from '../repository/volunteerRepository.js';
import ngoRepository from '../repository/ngoRepository.js';
import grantedHelpRepository from '../repository/grantedHelpRepository.js';
import helpRequestService from '../services/helpRequestService.js';

export const createRequest = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      crisisDescription,
      category,
      urgency,
      affectedCount,
      location,
      requirements,
      requiredVolunteers,
      volunteerId,
    } = req.body;

    if (!crisisDescription || !crisisDescription.trim()) {
      return res.status(400).json({ message: 'Crisis description is required.' });
    }

    const normalizedLocation = helpRequestService.normalizeLocation(location);
    if (!normalizedLocation) {
      return res.status(400).json({ message: 'Valid GPS latitude and longitude are required.' });
    }

    const normalizedRequirements = helpRequestService.normalizeRequirements(requirements);
    if (normalizedRequirements.length === 0) {
      return res.status(400).json({ message: 'At least one requested resource item is required.' });
    }

    const normalizedVolunteerRoles = helpRequestService.normalizeRequiredVolunteers(requiredVolunteers);

    let publicUser = null;
    let validVolunteer = null;

    if (volunteerId && mongoose.Types.ObjectId.isValid(volunteerId)) {
      validVolunteer = await volunteerRepository.findVolunteerById(volunteerId);
    }

    if (!validVolunteer) {
      if (!name?.trim() || !phone?.trim()) {
        return res.status(400).json({ message: 'Full name and contact phone are required for public requests.' });
      }
      publicUser = await publicUserRepository.findOrCreate({
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || undefined,
      });
    }

    const requestData = {
      publicUser: publicUser ? publicUser._id : null,
      volunteer: validVolunteer ? validVolunteer._id : null,
      category: helpRequestService.normalizeCategory(category),
      urgency: helpRequestService.normalizeUrgency(urgency),
      affectedCount: helpRequestService.normalizeAffectedCount(affectedCount),
      location: normalizedLocation,
      crisisDescription: crisisDescription.trim(),
      requirements: normalizedRequirements,
      requiredVolunteers: normalizedVolunteerRoles,
      status: validVolunteer ? 'validated' : 'pending',
      approvedBy: validVolunteer ? validVolunteer._id : null,
    };

    const newRequest = await helpRequestRepository.createHelpRequest(requestData);

    // Dynamic Trust Score: reward field volunteer for submitting a verified report
    if (validVolunteer) {
      await volunteerRepository.incrementTrustScore(validVolunteer._id, 10);
    }

    res.status(201).json({
      message: 'Help request created successfully',
      requestId: newRequest._id,
      request: newRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlatformStats = async (req, res, next) => {
  try {
    const [requestStats, ngoStats, volunteerStats, grantStats] = await Promise.all([
      helpRequestRepository.getStatusCounts(),
      ngoRepository.getCounts(),
      volunteerRepository.getCounts(),
      grantedHelpRepository.getGlobalGrantStats(),
    ]);

    res.status(200).json({
      requests: requestStats,
      ngos: ngoStats,
      volunteers: volunteerStats,
      grants: grantStats,
    });
  } catch (error) {
    next(error);
  }
};

export const trackRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Request ID format. Please double-check your 24-character ID.' });
    }

    const request = await helpRequestRepository.getHelpRequestById(id);
    if (!request) {
      return res.status(404).json({ message: 'No crisis request found with that Request ID.' });
    }

    const tracker = helpRequestService.formatPublicTracker(request);
    res.status(200).json(tracker);
  } catch (error) {
    next(error);
  }
};

export const getPendingRequests = async (req, res, next) => {
  try {
    const requests = await helpRequestRepository.getAllPendingRequests();
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

export const getVolunteerRequests = async (req, res, next) => {
  try {
    const { volunteerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
      return res.status(400).json({ message: 'Invalid volunteer ID.' });
    }
    const requests = await helpRequestRepository.getRequestsByVolunteer(volunteerId);
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

export const approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { volunteerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID.' });
    }
    if (!volunteerId || !mongoose.Types.ObjectId.isValid(volunteerId)) {
      return res.status(400).json({ message: 'Valid volunteer ID is required to validate a request.' });
    }

    const updatedRequest = await helpRequestRepository.updateHelpRequestStatus(id, 'validated', volunteerId);
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Help request not found.' });
    }

    // Dynamic Trust Score: reward volunteer for field verification
    await volunteerRepository.incrementTrustScore(volunteerId, 10);

    res.status(200).json({ message: 'Request validated successfully', request: updatedRequest });
  } catch (error) {
    next(error);
  }
};

export const resolveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { volunteerId } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID.' });
    }

    const updatedRequest = await helpRequestRepository.updateHelpRequestStatus(id, 'resolved');
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Help request not found.' });
    }

    if (volunteerId && mongoose.Types.ObjectId.isValid(volunteerId)) {
      await volunteerRepository.incrementTrustScore(volunteerId, 20);
    }

    res.status(200).json({ message: 'Mission marked as resolved!', request: updatedRequest });
  } catch (error) {
    next(error);
  }
};

export const voteHype = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { volunteerId, points } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID.' });
    }
    if (!volunteerId || !mongoose.Types.ObjectId.isValid(volunteerId)) {
      return res.status(400).json({ message: 'Valid volunteer ID is required to boost priority.' });
    }

    const safePoints = Math.min(5, Math.max(1, Number(points) || 1));
    const updatedRequest = await helpRequestRepository.voteHype(id, volunteerId, safePoints);
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Help request not found.' });
    }

    res.status(200).json({ message: 'Priority boost recorded', request: updatedRequest });
  } catch (error) {
    next(error);
  }
};

export const getApprovedRequests = async (req, res, next) => {
  try {
    const requests = await helpRequestRepository.getApprovedRequests();
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

export const getUnapprovedRequests = async (req, res, next) => {
  try {
    const requests = await helpRequestRepository.getUnapprovedRequests();
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

export const editRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID.' });
    }

    const existing = await helpRequestRepository.getHelpRequestById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Help request not found.' });
    }

    const updatePayload = {};
    if (req.body.crisisDescription) updatePayload.crisisDescription = req.body.crisisDescription.trim();
    if (req.body.category) updatePayload.category = helpRequestService.normalizeCategory(req.body.category);
    if (req.body.urgency) updatePayload.urgency = helpRequestService.normalizeUrgency(req.body.urgency);
    if (req.body.affectedCount !== undefined) {
      updatePayload.affectedCount = helpRequestService.normalizeAffectedCount(req.body.affectedCount);
    }
    if (req.body.location) {
      const normalizedLoc = helpRequestService.normalizeLocation(req.body.location);
      if (normalizedLoc) updatePayload.location = normalizedLoc;
    }
    if (Array.isArray(req.body.requirements)) {
      // Preserve grantedList references on existing requirements if matched by _id
      const existingGrantMap = new Map(
        existing.requirements.map((r) => [r._id.toString(), r.grantedList.map((g) => g._id || g)])
      );
      updatePayload.requirements = helpRequestService.normalizeRequirements(req.body.requirements).map((r) => {
        if (r._id && existingGrantMap.has(r._id.toString())) {
          return { ...r, grantedList: existingGrantMap.get(r._id.toString()) };
        }
        return r;
      });
    }
    if (Array.isArray(req.body.requiredVolunteers)) {
      updatePayload.requiredVolunteers = helpRequestService.normalizeRequiredVolunteers(req.body.requiredVolunteers);
    }

    const updatedRequest = await helpRequestRepository.updateHelpRequest(id, updatePayload);
    res.status(200).json({ message: 'Request updated successfully', request: updatedRequest });
  } catch (error) {
    next(error);
  }
};

export const assignToRole = async (req, res, next) => {
  try {
    const { id, roleId } = req.params;
    const { volunteerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(roleId)) {
      return res.status(400).json({ message: 'Invalid mission or role ID.' });
    }
    if (!volunteerId || !mongoose.Types.ObjectId.isValid(volunteerId)) {
      return res.status(400).json({ message: 'Valid volunteer ID is required.' });
    }

    const [volunteer, helpRequest] = await Promise.all([
      volunteerRepository.findVolunteerById(volunteerId),
      helpRequestRepository.getHelpRequestById(id),
    ]);

    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found.' });
    }

    const roleObj = helpRequest.requiredVolunteers.find((rv) => rv._id.toString() === roleId);
    const check = helpRequestService.canVolunteerJoinRole(volunteer, roleObj, volunteerId);
    if (!check.allowed) {
      return res.status(400).json({ message: check.reason });
    }

    const updatedRequest = await helpRequestRepository.assignVolunteerToRole(id, roleId, volunteerId);
    await volunteerRepository.incrementTrustScore(volunteerId, 10);

    res.status(200).json({ message: 'Volunteer assigned to role successfully', request: updatedRequest });
  } catch (error) {
    next(error);
  }
};

export const unassignFromRole = async (req, res, next) => {
  try {
    const { id, roleId } = req.params;
    const { volunteerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(roleId)) {
      return res.status(400).json({ message: 'Invalid mission or role ID.' });
    }
    if (!volunteerId || !mongoose.Types.ObjectId.isValid(volunteerId)) {
      return res.status(400).json({ message: 'Valid volunteer ID is required.' });
    }

    const updatedRequest = await helpRequestRepository.unassignVolunteerFromRole(id, roleId, volunteerId);
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Mission or role not found.' });
    }

    res.status(200).json({ message: 'Volunteer unassigned from role', request: updatedRequest });
  } catch (error) {
    next(error);
  }
};
