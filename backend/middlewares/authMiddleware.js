import authService from '../services/authService.js';
import ngoRepository from '../repository/ngoRepository.js';
import adminRepository from '../repository/adminRepository.js';

export const authenticateNgo = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = authService.verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const ngo = await ngoRepository.findNgoById(decoded.id);
    if (!ngo) {
      return res.status(401).json({ message: 'NGO not found' });
    }

    req.ngo = ngo;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = authService.verifyToken(token);
    if (!decoded || !decoded.id || decoded.role !== 'superadmin') {
      return res.status(401).json({ message: 'Invalid or unauthorized token' });
    }

    const admin = await adminRepository.findAdminById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};
