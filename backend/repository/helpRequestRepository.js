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
      .populate('requiredVolunteers.assignedVolunteers')
      .populate({
        path: 'requirements.grantedList',
        populate: {
          path: 'ngoId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
  }

  async updateHelpRequestStatus(id, status, volunteerId) {
    const update = { status };
    if (volunteerId) update.approvedBy = volunteerId;
    return await HelpRequest.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).populate('approvedBy').populate('requiredVolunteers.assignedVolunteers');
  }


  async voteHype(requestId, volunteerId, points) {
      return await HelpRequest.findByIdAndUpdate(
          requestId,
          { $push: { hype: { volunteer: volunteerId, points } } },
          { new: true }
      ).populate('hype.volunteer').populate('requiredVolunteers.assignedVolunteers');
  }


  async updateHelpRequest(id, data) {
    return await HelpRequest.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).populate('publicUser').populate('approvedBy').populate('requiredVolunteers.assignedVolunteers');
  }

  async assignVolunteerToRole(requestId, roleId, volunteerId) {
    // Check if volunteer has verified skill for this role
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) throw new Error('Volunteer not found');

    const helpRequest = await HelpRequest.findById(requestId);
    if (!helpRequest) throw new Error('Help request not found');

    const roleObj = helpRequest.requiredVolunteers.id(roleId);
    if (!roleObj) throw new Error('Role not found in request');

    const skill = volunteer.skills.find(s => s.name === roleObj.role);
    if (!skill || !skill.verified) {
      throw new Error(`Volunteer must have a verified '${roleObj.role}' skill to join this role.`);
    }

    return await HelpRequest.findOneAndUpdate(
      { _id: requestId, 'requiredVolunteers._id': roleId },
      { $addToSet: { 'requiredVolunteers.$.assignedVolunteers': volunteerId } },
      { new: true }
    ).populate('requiredVolunteers.assignedVolunteers');
  }

  async unassignVolunteerFromRole(requestId, roleId, volunteerId) {
    return await HelpRequest.findOneAndUpdate(
      { _id: requestId, 'requiredVolunteers._id': roleId },
      { $pull: { 'requiredVolunteers.$.assignedVolunteers': volunteerId } },
      { new: true }
    ).populate('requiredVolunteers.assignedVolunteers');
  }

  async getAllHelpRequests() {
    return await HelpRequest.find()
      .populate('publicUser')
      .populate('approvedBy')
      .populate('requiredVolunteers.assignedVolunteers')
      .sort({ createdAt: -1 });
  }

  // helpRequestRepository.js

  async getApprovedRequests() {
    return await HelpRequest.find({
      approvedBy: { $ne: null }
    })
      .populate('publicUser')
      .populate('approvedBy')
      .populate('requiredVolunteers.assignedVolunteers')
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
      .populate('requiredVolunteers.assignedVolunteers')
      .sort({ createdAt: -1 });
  }
}

export default new HelpRequestRepository();

