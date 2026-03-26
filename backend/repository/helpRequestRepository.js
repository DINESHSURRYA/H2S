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
      .populate({
        path: 'requirements.grantedList',
        populate: {
          path: 'ngoId',
          select: 'name'
        }
      });
  }

  async getAllPendingRequests() {
    return await HelpRequest.find({
      approvedBy: null,              // ✅ not approved by anyone
      status: 'pending'              // ✅ still pending (optional but recommended)
    })
      .populate('publicUser')
      .populate('approvedBy')
      .sort({ createdAt: -1 });
  }

  async getRequestsByVolunteer(volunteerId) {
    return await HelpRequest.find({ approvedBy: volunteerId })
      .populate('publicUser')
      .sort({ createdAt: -1 });
  }

  async updateHelpRequestStatus(id, status, volunteerId) {
    const update = { status };
    if (volunteerId) update.approvedBy = volunteerId;
    return await HelpRequest.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).populate('approvedBy');
  }

  async toggleLock(id, isLocked, ngoId) {
    return await HelpRequest.findByIdAndUpdate(
        id,
        { isLocked, lockedByNGO: isLocked ? ngoId : null },
        { new: true }
    );
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

  // helpRequestRepository.js

  async getApprovedRequests() {
    return await HelpRequest.find({
      approvedBy: { $ne: null }
    })
      .populate('publicUser')
      .populate('approvedBy')
      .populate({
        path: 'requirements.grantedList',
        populate: {
          path: 'ngoId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
  }

  async getUnapprovedRequests() {
    return await HelpRequest.find({
      approvedBy: null            // ✅ only NOT approved
    })
      .populate('publicUser')
      .sort({ createdAt: -1 });
  }
}

export default new HelpRequestRepository();

