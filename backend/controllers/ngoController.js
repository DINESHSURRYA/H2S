import ngoRepository from '../repository/ngoRepository.js';
import authService from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, registrationNumber, address } = req.body;

    const existingNgo = await ngoRepository.findNgoByEmail(email);
    if (existingNgo) {
      return res.status(400).json({ message: 'NGO with this email already exists' });
    }

    const hashedPassword = await authService.hashPassword(password);
    const ngo = await ngoRepository.createNgo({
      name,
      email,
      password: hashedPassword,
      phone,
      registrationNumber,
      address,
    });

    const token = authService.generateToken({ id: ngo._id, role: 'ngo' });

    res.status(201).json({
      message: 'NGO registered successfully',
      ngo: {
        id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        status: ngo.status,
      },
      token,
    });
  } catch (error) {
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
      ngo: {
        id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        status: ngo.status,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
