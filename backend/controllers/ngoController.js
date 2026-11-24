import mongoose from 'mongoose';
import ngoRepository from '../repository/ngoRepository.js';
import grantedHelpRepository from '../repository/grantedHelpRepository.js';
import authService from '../services/authService.js';

const serializeNgo = (ngo) => ({
  id: ngo._id,
  _id: ngo._id,
  name: ngo.name,
  email: ngo.email,
  phone: ngo.phone || '',
  registrationNumber: ngo.registrationNumber || '',
  address: ngo.address || '',
  isVerified: ngo.isVerified,
  trustScore: ngo.trustScore || 0,
  status: ngo.status,
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, registrationNumber, address } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingNgo = await ngoRepository.findNgoByEmail(email);
    if (existingNgo) {
      return res.status(400).json({ message: 'An NGO with this email already exists.' });
    }

    const hashedPassword = await authService.hashPassword(password);
    const ngo = await ngoRepository.createNgo({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone?.trim(),
      registrationNumber: registrationNumber?.trim() || undefined,
      address: address?.trim(),
    });

    const token = authService.generateToken({ id: ngo._id, role: 'ngo' });

    res.status(201).json({
      message: 'NGO registered successfully (pending Admin verification)',
      ngo: serializeNgo(ngo),
      token,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'An NGO with that email or registration number already exists.' });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const ngo = await ngoRepository.findNgoByEmail(email);
    if (!ngo) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await authService.comparePassword(password, ngo.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = authService.generateToken({ id: ngo._id, role: 'ngo' });

    res.status(200).json({
      message: 'Logged in successfully',
      ngo: serializeNgo(ngo),
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid NGO ID.' });
    }
    const ngo = await ngoRepository.findNgoById(id);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found.' });
    }
    res.status(200).json(serializeNgo(ngo));
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid NGO ID.' });
    }
    const [ngo, grantStats] = await Promise.all([
      ngoRepository.findNgoById(id),
      grantedHelpRepository.getNgoAggregateStats(id),
    ]);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found.' });
    }
    res.status(200).json({
      ngo: serializeNgo(ngo),
      stats: grantStats,
    });
  } catch (error) {
    next(error);
  }
};
