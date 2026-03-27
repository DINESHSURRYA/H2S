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
      skills: (skills || []).map(s => ({ name: s, verified: false })),
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
        skills: volunteer.skills,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, availability, skills } = req.body;
    
    // If skills are provided as strings, map them carefully (existing ones should keep verification)
    const currentVolunteer = await volunteerRepository.findVolunteerById(id);
    let updatedSkills = currentVolunteer.skills;
    
    if (skills) {
      updatedSkills = skills.map(skillName => {
        const existing = currentVolunteer.skills.find(s => s.name === skillName);
        return existing || { name: skillName, verified: false };
      });
    }

    const updated = await volunteerRepository.updateVolunteer(id, { name, phone, availability, skills: updatedSkills });
    res.status(200).json({ message: 'Profile updated', volunteer: updated });
  } catch (error) {
    next(error);
  }
};

export const verifySkill = async (req, res, next) => {
  try {
    const { volunteerId, skillName, report } = req.body;
    const ngoId = req.ngo._id; // From authenticateNgo middleware
    const updated = await volunteerRepository.verifySkill(volunteerId, skillName, ngoId, report);
    res.status(200).json({ message: 'Skill verified successfully', volunteer: updated });
  } catch (error) {
    next(error);
  }
};

export const getUnverifiedVolunteers = async (req, res, next) => {
  try {
    const volunteers = await volunteerRepository.getUnverifiedVolunteers();
    res.status(200).json(volunteers);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
    try {
        const volunteer = await volunteerRepository.findVolunteerById(req.params.id);
        res.status(200).json(volunteer);
    } catch (error) {
        next(error);
    }
}

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
        skills: volunteer.skills,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
