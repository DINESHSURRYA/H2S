import Volunteer from '../models/volunteerModel.js';

class VolunteerRepository {
  async createVolunteer(volunteerData) {
    const volunteer = new Volunteer(volunteerData);
    return await volunteer.save();
  }

  async findVolunteerByEmail(email) {
    return await Volunteer.findOne({ email });
  }

  async findVolunteerByAadhar(aadharNumber) {
    return await Volunteer.findOne({ aadharNumber });
  }

  async findVolunteerById(id) {
    return await Volunteer.findById(id)
      .select('-password')
      .populate('skills.verifiedBy', 'name');
  }

  async getAllVolunteers() {
    return await Volunteer.find({}).sort({ createdAt: -1 }).populate('skills.verifiedBy', 'name');
  }

  async updateVolunteer(id, data) {
    return await Volunteer.findByIdAndUpdate(id, { $set: data }, { new: true }).select('-password');
  }

  async verifySkill(volunteerId, skillName, ngoId, report) {
    return await Volunteer.findOneAndUpdate(
      { _id: volunteerId, 'skills.name': skillName },
      { 
        $set: { 
          'skills.$.verified': true,
          'skills.$.verifiedBy': ngoId,
          'skills.$.verificationReport': report,
          'skills.$.verifiedAt': new Date()
        } 
      },
      { new: true }
    ).select('-password').populate('skills.verifiedBy', 'name');
  }

  async getUnverifiedVolunteers() {
    return await Volunteer.find({ 
        'skills.verified': { $ne: true },
        'skills.0': { $exists: true } // Ensure they have at least one skill
    }).select('name email skills phone').sort({ createdAt: -1 });
  }

  async updateVolunteerStatus(id, status) {
    return await Volunteer.findByIdAndUpdate(id, { status }, { new: true });
  }
}

export default new VolunteerRepository();
