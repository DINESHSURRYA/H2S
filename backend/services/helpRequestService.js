import PublicUser from '../models/publicUserModel.js';

class HelpRequestService {
  /**
   * Pre-processes help request data before storage.
   * Handles auto-approval logic for logged-in volunteers.
   */
  async processCreateRequest(data) {
    const processedData = { ...data };

    // 1. Logic for Public User creation/finding
    if (!processedData.raisedBy && !processedData.publicUserId && processedData.name && processedData.phone) {
      let publicUser = await PublicUser.findOne({ phone: processedData.phone });
      if (!publicUser) {
        publicUser = await PublicUser.create({
          name: processedData.name,
          phone: processedData.phone,
          email: processedData.email
        });
      }
      processedData.publicUserId = publicUser._id;
    }

    // 2. Business Logic: If raised by a logged-in volunteer, auto-approve it
    if (processedData.raisedBy) {
      processedData.status = 'in-progress';
      processedData.approvedBy = processedData.raisedBy;
    }

    // Default: Ensure requirements are treated as an array
    if (!processedData.requirements) {
      processedData.requirements = [];
    }

    return processedData;
  }
}

export default new HelpRequestService();
