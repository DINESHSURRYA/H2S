import adminRepository from '../repository/adminRepository.js';
import ngoRepository from '../repository/ngoRepository.js';
import authService from '../services/authService.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await adminRepository.findAdminByEmail(email);
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
      token,
    });
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

    if (!['active', 'suspended'].includes(status)) {
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
