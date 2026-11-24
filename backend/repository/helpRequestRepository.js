import mongoose from 'mongoose';
import HelpRequest from '../models/helpRequestModel.js';

const STANDARD_POPULATE = [
  { path: 'publicUser', select: 'name phone email' },
  { path: 'volunteer', select: 'name email phone trustScore' },
  { path: 'approvedBy', select: 'name email trustScore' },
  { path: 'requiredVolunteers.assignedVolunteers', select: 'name email skills trustScore' },
  {
    path: 'requirements.grantedList',
    populate: {
      path: 'ngoId',
      select: 'name status isVerified trustScore',
    },
  },
];

class HelpRequestRepository {
  async createHelpRequest(data) {
    const helpRequest = new HelpRequest(data);
    const saved = await helpRequest.save();
    return await HelpRequest.findById(saved._id).populate(STANDARD_POPULATE);
  }

  async getHelpRequestById(id) {
    return await HelpRequest.findById(id).populate(STANDARD_POPULATE);
  }

  async getAllPendingRequests() {
    return await HelpRequest.find({
      approvedBy: null,
      status: 'pending',
    })
      .populate(STANDARD_POPULATE)
      .sort({ createdAt: -1 });
  }

  async getRequestsByVolunteer(volunteerId) {
    return await HelpRequest.find({
      $or: [
        { approvedBy: volunteerId },
        { volunteer: volunteerId },
        { 'requiredVolunteers.assignedVolunteers': volunteerId },
      ],
    })
      .populate(STANDARD_POPULATE)
      .sort({ createdAt: -1 });
  }

  async updateHelpRequestStatus(id, status, volunteerId = null) {
    const update = { status };
    if (volunteerId) update.approvedBy = volunteerId;
    return await HelpRequest.findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' }).populate(STANDARD_POPULATE);
  }

  async voteHype(requestId, volunteerId, points = 1) {
    // Update existing vote if volunteer already hyped this request
    const updatedExisting = await HelpRequest.findOneAndUpdate(
      { _id: requestId, 'hype.volunteer': volunteerId },
      { $set: { 'hype.$.points': points } },
      { returnDocument: 'after' }
    ).populate(STANDARD_POPULATE);

    if (updatedExisting) {
      return updatedExisting;
    }

    // Otherwise add a new hype entry
    return await HelpRequest.findByIdAndUpdate(
      requestId,
      { $push: { hype: { volunteer: volunteerId, points } } },
      { returnDocument: 'after' }
    ).populate(STANDARD_POPULATE);
  }

  async updateHelpRequest(id, data) {
    return await HelpRequest.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' }).populate(STANDARD_POPULATE);
  }

  async pushGrantToRequirement(helpRequestId, requirementId, grantId) {
    const reqObjId = new mongoose.Types.ObjectId(requirementId);
    return await HelpRequest.findByIdAndUpdate(
      helpRequestId,
      {
        $push: {
          'requirements.$[elem].grantedList': grantId,
        },
        $set: { status: 'in-progress' },
      },
      {
        arrayFilters: [{ 'elem._id': reqObjId }],
        returnDocument: 'after',
      }
    ).populate(STANDARD_POPULATE);
  }

  async assignVolunteerToRole(requestId, roleId, volunteerId) {
    return await HelpRequest.findOneAndUpdate(
      { _id: requestId, 'requiredVolunteers._id': roleId },
      { $addToSet: { 'requiredVolunteers.$.assignedVolunteers': volunteerId } },
      { returnDocument: 'after' }
    ).populate(STANDARD_POPULATE);
  }

  async unassignVolunteerFromRole(requestId, roleId, volunteerId) {
    return await HelpRequest.findOneAndUpdate(
      { _id: requestId, 'requiredVolunteers._id': roleId },
      { $pull: { 'requiredVolunteers.$.assignedVolunteers': volunteerId } },
      { returnDocument: 'after' }
    ).populate(STANDARD_POPULATE);
  }

  async getAllHelpRequests() {
    return await HelpRequest.find().populate(STANDARD_POPULATE).sort({ createdAt: -1 });
  }

  async getApprovedRequests() {
    return await HelpRequest.find({
      approvedBy: { $ne: null },
    })
      .populate(STANDARD_POPULATE)
      .sort({ createdAt: -1 });
  }

  async getUnapprovedRequests() {
    return await HelpRequest.find({
      approvedBy: null,
    })
      .populate(STANDARD_POPULATE)
      .sort({ createdAt: -1 });
  }

  async getStatusCounts() {
    const grouped = await HelpRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          affected: { $sum: { $ifNull: ['$affectedCount', 1] } },
        },
      },
    ]);

    const summary = {
      total: 0,
      pending: 0,
      validated: 0,
      inProgress: 0,
      resolved: 0,
      totalAffected: 0,
    };

    for (const item of grouped) {
      summary.total += item.count;
      summary.totalAffected += item.affected;
      if (item._id === 'pending') summary.pending = item.count;
      else if (item._id === 'validated') summary.validated = item.count;
      else if (item._id === 'in-progress') summary.inProgress = item.count;
      else if (item._id === 'resolved') summary.resolved = item.count;
    }

    return summary;
  }
}

export default new HelpRequestRepository();
