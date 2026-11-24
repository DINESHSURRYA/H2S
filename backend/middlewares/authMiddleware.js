import authService from '../services/authService.js';
import ngoRepository from '../repository/ngoRepository.js';
import adminRepository from '../repository/adminRepository.js';
import volunteerRepository from '../repository/volunteerRepository.js';

export const authenticateNgo = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'NGO authentication required' });
    }

    const decoded = authService.verifyToken(token);
    if (!decoded || !decoded.id || decoded.role !== 'ngo') {
      return res.status(401).json({ message: 'Invalid or expired NGO token' });
    }

    const ngo = await ngoRepository.findNgoById(decoded.id);
    if (!ngo) {
      return res.status(401).json({ message: 'NGO account not found' });
    }

    req.ngo = ngo;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

export const authenticateVolunteer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Volunteer authentication required' });
    }

    const decoded = authService.verifyToken(token);
    if (!decoded || !decoded.id || decoded.role !== 'volunteer') {
      return res.status(401).json({ message: 'Invalid or expired volunteer token' });
    }

    const volunteer = await volunteerRepository.findVolunteerById(decoded.id);
    if (!volunteer) {
      return res.status(401).json({ message: 'Volunteer account not found' });
    }

    req.volunteer = volunteer;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }

    const decoded = authService.verifyToken(token);
    if (!decoded || !decoded.id || decoded.role !== 'superadmin') {
      return res.status(401).json({ message: 'Invalid or unauthorized admin token' });
    }

    const admin = await adminRepository.findAdminById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: 'Admin account not found' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};
