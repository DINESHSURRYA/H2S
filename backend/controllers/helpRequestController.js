import helpRequestRepository from '../repository/helpRequestRepository.js';

export const createRequest = async (req, res, next) => {
  try {
    const { name, contactInfo, email, location, description, products, raisedBy } = req.body;

    const requestData = {
      name,
      contactInfo,
      email,
      location,
      description,
      products,
      raisedBy,
    };

    // If raised by a logged-in volunteer, auto-approve it
    if (raisedBy) {
      requestData.status = 'in-progress';
      requestData.approvedBy = raisedBy;
    }

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
    const { volunteerId } = req.query;
    const requests = await helpRequestRepository.getAllPendingRequests(volunteerId);
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

export const getVolunteerRaisedRequests = async (req, res, next) => {
  try {
    const { volunteerId } = req.params;
    const requests = await helpRequestRepository.getRequestsRaisedByVolunteer(volunteerId);
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
