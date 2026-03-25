import volunteerRepository from '../repository/volunteerRepository.js';
import authService from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, aadharNumber, phone, skills, availability } = req.body;

    const existingEmail = await volunteerRepository.findVolunteerByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Volunteer with this email already exists' });
    }

    const existingAadhar = await volunteerRepository.findVolunteerByAadhar(aadharNumber);
    if (existingAadhar) {
      return res.status(400).json({ message: 'Volunteer with this Aadhaar Number already exists' });
    }

    const hashedPassword = await authService.hashPassword(password);
    const volunteer = await volunteerRepository.createVolunteer({
      name,
      email,
      password: hashedPassword,
      aadharNumber,
      phone,
      skills,
      availability,
    });

    const token = authService.generateToken({ id: volunteer._id, role: 'volunteer' });

    res.status(201).json({
      message: 'Volunteer registered successfully',
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        status: volunteer.status,
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

    const volunteer = await volunteerRepository.findVolunteerByEmail(email);
    if (!volunteer) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await authService.comparePassword(password, volunteer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = authService.generateToken({ id: volunteer._id, role: 'volunteer' });

    res.status(200).json({
      message: 'Logged in successfully',
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        status: volunteer.status,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
