import helpRequestRepository from '../repository/helpRequestRepository.js';
import publicUserRepository from '../repository/publicUserRepository.js';
import volunteerRepository from '../repository/volunteerRepository.js';

export const createRequest = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      crisisDescription,
      location,
      requirements,
      volunteerId
    } = req.body;

    let publicUser = null;
    let validVolunteer = null;

    // ✅ Check if volunteer exists
    if (volunteerId) {
      validVolunteer = await volunteerRepository.findVolunteerById(volunteerId);
    }

    // ✅ If no valid volunteer → fallback to public user
    if (!validVolunteer) {
      publicUser = await publicUserRepository.findOrCreate({
        name,
        phone,
        email
      });
    }

    const requestData = {
      publicUser: publicUser ? publicUser._id : null,
      location,
      crisisDescription,
      requirements: requirements.map(req => ({
        ...req,
        quantity: Math.max(1, Number(req.quantity) || 1) // 🔒 safe guard
      })),
      status: validVolunteer ? 'validated' : 'pending',
      approvedBy: validVolunteer ? validVolunteer._id : null
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
    const updatedRequest = await helpRequestRepository.updateHelpRequestStatus(id, 'validated', volunteerId);
    res.status(200).json({ message: 'Request validated successfully', request: updatedRequest });
  } catch (error) {
    next(error);
  }
};

export const toggleLock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isLocked, ngoId } = req.body;
    const updatedRequest = await helpRequestRepository.toggleLock(id, isLocked, ngoId);
    res.status(200).json({ message: isLocked ? 'Request locked' : 'Request unlocked', request: updatedRequest });
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


