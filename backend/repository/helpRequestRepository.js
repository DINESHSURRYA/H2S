import HelpRequest from '../models/helpRequestModel.js';

class HelpRequestRepository {
  async createHelpRequest(data) {
    const helpRequest = new HelpRequest(data);
    return await (await helpRequest.save()).populate('publicUser');
  }

  async getHelpRequestById(id) {
    return await HelpRequest.findById(id)
      .populate('publicUser')
      .populate('approvedBy')
      .populate('hype.volunteer')
      .populate({
          path: 'requirements.grantedList',
          populate: { path: 'ngoId' }
      });
  }

  async getAllPendingRequests() {
    return await HelpRequest.find({ status: 'pending' })
      .populate('publicUser')
      .sort({ createdAt: -1 });
  }

  async getRequestsByVolunteer(volunteerId) {
    return await HelpRequest.find({ approvedBy: volunteerId })
      .populate('publicUser')
      .sort({ createdAt: -1 });
  }

  async updateHelpRequestStatus(id, status, volunteerId) {
    return await HelpRequest.findByIdAndUpdate(
      id,
      { status, approvedBy: volunteerId },
      { new: true }
    ).populate('approvedBy');
  }

  async voteHype(requestId, volunteerId, points) {
      return await HelpRequest.findByIdAndUpdate(
          requestId,
          { $push: { hype: { volunteer: volunteerId, points } } },
          { new: true }
      ).populate('hype.volunteer');
  }

  async getAllHelpRequests() {
    return await HelpRequest.find()
      .populate('publicUser')
      .populate('approvedBy')
      .sort({ createdAt: -1 });
  }
}

export default new HelpRequestRepository();

