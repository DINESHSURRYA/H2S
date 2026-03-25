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
    return await Volunteer.findById(id).select('-password');
  }

  async getAllVolunteers() {
    return await Volunteer.find({}).sort({ createdAt: -1 });
  }

  async updateVolunteerStatus(id, status) {
    return await Volunteer.findByIdAndUpdate(id, { status }, { new: true });
  }
}

export default new VolunteerRepository();
