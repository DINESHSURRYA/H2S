import mongoose from 'mongoose';
import volunteerRepository from '../repository/volunteerRepository.js';
import ngoRepository from '../repository/ngoRepository.js';
import authService from '../services/authService.js';
import helpRequestService from '../services/helpRequestService.js';

const serializeVolunteer = (v) => ({
  id: v._id,
  _id: v._id,
  name: v.name,
  email: v.email,
  phone: v.phone || '',
  aadharNumber: v.aadharNumber,
  availability: v.availability,
  status: v.status,
  trustScore: v.trustScore || 0,
  skills: v.skills || [],
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password, aadharNumber, phone, skills, availability } = req.body;

    if (!name?.trim() || !email?.trim() || !password || !aadharNumber?.trim()) {
      return res.status(400).json({ message: 'Name, email, password, and Aadhaar number are required.' });
    }

    const existingEmail = await volunteerRepository.findVolunteerByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Volunteer with this email already exists' });
    }

    const existingAadhar = await volunteerRepository.findVolunteerByAadhar(aadharNumber);
    if (existingAadhar) {
      return res.status(400).json({ message: 'Volunteer with this Aadhaar Number already exists' });
    }

    const skillNames = helpRequestService.normalizeSkillNames(skills);
    const hashedPassword = await authService.hashPassword(password);
    const volunteer = await volunteerRepository.createVolunteer({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      aadharNumber: aadharNumber.trim(),
      phone: phone?.trim(),
      skills: skillNames.map((s) => ({ name: s, verified: false })),
      availability: availability || 'part-time',
    });

    const token = authService.generateToken({ id: volunteer._id, role: 'volunteer' });

    res.status(201).json({
      message: 'Volunteer registered successfully',
      volunteer: serializeVolunteer(volunteer),
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid volunteer ID.' });
    }

    const { name, phone, availability, skills } = req.body;
    const currentVolunteer = await volunteerRepository.findVolunteerById(id);
    if (!currentVolunteer) {
      return res.status(404).json({ message: 'Volunteer not found.' });
    }

    let updatedSkills = currentVolunteer.skills;
    if (Array.isArray(skills)) {
      const normalizedNames = helpRequestService.normalizeSkillNames(skills);
      updatedSkills = normalizedNames.map((skillName) => {
        const existing = currentVolunteer.skills.find((s) => s.name === skillName);
        return existing || { name: skillName, verified: false };
      });
    }

    const updateData = { skills: updatedSkills };
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (availability !== undefined) updateData.availability = availability;

    const updated = await volunteerRepository.updateVolunteer(id, updateData);
    res.status(200).json({ message: 'Profile updated', volunteer: serializeVolunteer(updated) });
  } catch (error) {
    next(error);
  }
};

export const verifySkill = async (req, res, next) => {
  try {
    const { volunteerId, skillName, report } = req.body;
    const ngo = req.ngo;

    if (ngo.status !== 'active') {
      return res.status(403).json({
        message: 'Only Admin-verified active NGOs can certify volunteer skills.',
      });
    }
    if (!volunteerId || !skillName || !report?.trim()) {
      return res.status(400).json({ message: 'Volunteer ID, skill name, and verification report are required.' });
    }

    const updated = await volunteerRepository.verifySkill(volunteerId, skillName, ngo._id, report.trim());
    if (!updated) {
      return res.status(404).json({ message: 'Volunteer or requested skill not found.' });
    }

    // Dynamic Trust Score rewards for verified credentialing
    await Promise.all([
      volunteerRepository.incrementTrustScore(volunteerId, 15),
      ngoRepository.incrementTrustScore(ngo._id, 5),
    ]);

    const refreshed = await volunteerRepository.findVolunteerById(volunteerId);
    res.status(200).json({ message: 'Skill verified successfully', volunteer: serializeVolunteer(refreshed) });
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
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid volunteer ID.' });
    }
    const volunteer = await volunteerRepository.findVolunteerById(id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found.' });
    }
    res.status(200).json(serializeVolunteer(volunteer));
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

    if (volunteer.status === 'suspended') {
      return res.status(403).json({ message: 'Your volunteer account has been suspended by an administrator.' });
    }

    const token = authService.generateToken({ id: volunteer._id, role: 'volunteer' });

    res.status(200).json({
      message: 'Logged in successfully',
      volunteer: serializeVolunteer(volunteer),
      token,
    });
  } catch (error) {
    next(error);
  }
};
