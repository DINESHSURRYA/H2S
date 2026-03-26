import helpRequestRepository from '../repository/helpRequestRepository.js';
import publicUserRepository from '../repository/publicUserRepository.js';

export const createRequest = async (req, res, next) => {
  try {
    const { name, phone, email, location, crisisDescription, requirements } = req.body;

    // Find or create public user
    const publicUser = await publicUserRepository.findOrCreate({ name, phone, email });

    const requestData = {
      publicUser: publicUser._id,
      location,
      crisisDescription,
      requirements,
      status: 'pending'
    };

    const newRequest = await helpRequestRepository.createHelpRequest(requestData);

    res.status(201).json({
      message: 'Help request created successfully',
      requestId: newRequest._id,
      request: newRequest
    });
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
    const updatedRequest = await helpRequestRepository.updateHelpRequestStatus(id, 'in-progress', volunteerId);
    res.status(200).json({ message: 'Request approved successfully', request: updatedRequest });
  } catch (error) {
    next(error);
  }
};

export const voteHype = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { volunteerId, points } = req.body;
        const updatedRequest = await helpRequestRepository.voteHype(id, volunteerId, points);
        res.status(200).json({ message: 'Hype points added', request: updatedRequest });
    } catch (error) {
        next(error);
    }
}

