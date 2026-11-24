import adminRepository from '../repository/adminRepository.js';
import ngoRepository from '../repository/ngoRepository.js';
import volunteerRepository from '../repository/volunteerRepository.js';
import helpRequestRepository from '../repository/helpRequestRepository.js';
import grantedHelpRepository from '../repository/grantedHelpRepository.js';
import authService from '../services/authService.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await adminRepository.findAdminByEmail(email?.toLowerCase().trim());
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await authService.comparePassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = authService.generateToken({ id: admin._id, role: 'superadmin' });

    res.status(200).json({
      message: 'Admin logged in successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getOverview = async (req, res, next) => {
  try {
    const [ngos, volunteers, requests, grants] = await Promise.all([
      ngoRepository.getCounts(),
      volunteerRepository.getCounts(),
      helpRequestRepository.getStatusCounts(),
      grantedHelpRepository.getGlobalGrantStats(),
    ]);

    res.status(200).json({ ngos, volunteers, requests, grants });
  } catch (error) {
    next(error);
  }
};

export const getAllNgos = async (req, res, next) => {
  try {
    const ngos = await ngoRepository.getAllNgos();
    res.status(200).json(ngos);
  } catch (error) {
    next(error);
  }
};

export const verifyNgo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const ngo = await ngoRepository.updateNgoStatus(id, status);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    res.status(200).json({ message: `NGO status updated to ${status}`, ngo });
  } catch (error) {
    next(error);
  }
};

export const getAllVolunteers = async (req, res, next) => {
  try {
    const volunteers = await volunteerRepository.getAllVolunteers();
    res.status(200).json(volunteers);
  } catch (error) {
    next(error);
  }
};

export const updateVolunteerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid volunteer status' });
    }

    const volunteer = await volunteerRepository.updateVolunteerStatus(id, status);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    res.status(200).json({ message: `Volunteer status updated to ${status}`, volunteer });
  } catch (error) {
    next(error);
  }
};

export const getAllRequests = async (req, res, next) => {
  try {
    const requests = await helpRequestRepository.getAllHelpRequests();
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};
