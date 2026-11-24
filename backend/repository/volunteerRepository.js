import Volunteer from '../models/volunteerModel.js';

class VolunteerRepository {
  async createVolunteer(volunteerData) {
    const volunteer = new Volunteer(volunteerData);
    return await volunteer.save();
  }

  async findVolunteerByEmail(email) {
    return await Volunteer.findOne({ email: email?.toLowerCase().trim() });
  }

  async findVolunteerByAadhar(aadharNumber) {
    return await Volunteer.findOne({ aadharNumber: aadharNumber?.trim() });
  }

  async findVolunteerById(id) {
    return await Volunteer.findById(id)
      .select('-password')
      .populate('skills.verifiedBy', 'name');
  }

  async getAllVolunteers() {
    return await Volunteer.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .populate('skills.verifiedBy', 'name');
  }

  async updateVolunteer(id, data) {
    return await Volunteer.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' })
      .select('-password')
      .populate('skills.verifiedBy', 'name');
  }

  async incrementTrustScore(id, delta) {
    return await Volunteer.findByIdAndUpdate(
      id,
      { $inc: { trustScore: delta } },
      { returnDocument: 'after' }
    ).select('-password');
  }

  async verifySkill(volunteerId, skillName, ngoId, report) {
    return await Volunteer.findOneAndUpdate(
      { _id: volunteerId, 'skills.name': skillName },
      {
        $set: {
          'skills.$.verified': true,
          'skills.$.verifiedBy': ngoId,
          'skills.$.verificationReport': report,
          'skills.$.verifiedAt': new Date(),
        },
      },
      { returnDocument: 'after' }
    )
      .select('-password')
      .populate('skills.verifiedBy', 'name');
  }

  async getUnverifiedVolunteers() {
    return await Volunteer.find({
      skills: { $elemMatch: { verified: false } },
    })
      .select('name email skills phone trustScore availability')
      .sort({ createdAt: -1 });
  }

  async updateVolunteerStatus(id, status) {
    return await Volunteer.findByIdAndUpdate(id, { $set: { status } }, { returnDocument: 'after' }).select('-password');
  }

  async getCounts() {
    const [total, active, suspended] = await Promise.all([
      Volunteer.countDocuments(),
      Volunteer.countDocuments({ status: 'active' }),
      Volunteer.countDocuments({ status: 'suspended' }),
    ]);
    return { total, active, suspended };
  }
}

export default new VolunteerRepository();
