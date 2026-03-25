import HelpRequest from '../models/helpRequestModel.js';

class HelpRequestRepository {
  async createHelpRequest(data) {
    const helpRequest = new HelpRequest(data);
    return await helpRequest.save();
  }

  async getHelpRequestById(id) {
    return await HelpRequest.findById(id);
  }

  async getAllPendingRequests(volunteerId = null) {
    const query = { status: 'pending' };
    if (volunteerId) {
      query.raisedBy = { $ne: volunteerId };
    }
    return await HelpRequest.find(query).sort({ createdAt: -1 });
  }

  async getRequestsByVolunteer(volunteerId) {
    return await HelpRequest.find({ 
      approvedBy: volunteerId, 
      raisedBy: { $ne: volunteerId } 
    }).sort({ createdAt: -1 });
  }

  async getRequestsRaisedByVolunteer(volunteerId) {
    return await HelpRequest.find({ raisedBy: volunteerId }).sort({ createdAt: -1 });
  }

  async updateHelpRequestStatus(id, status, volunteerId) {
    return await HelpRequest.findByIdAndUpdate(
      id,
      { status, approvedBy: volunteerId },
      { new: true }
    );
  }

  async getAllHelpRequests() {
    return await HelpRequest.find().sort({ createdAt: -1 });
  }
}

export default new HelpRequestRepository();
