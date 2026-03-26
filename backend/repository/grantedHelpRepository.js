import GrantedHelp from '../models/grantedHelpModel.js';
import HelpRequest from '../models/helpRequestModel.js';

class GrantedHelpRepository {

  async createGrantedHelp(data) {
    const safeQty = Math.max(1, Number(data.quantityApproved) || 1);

    // 🔍 Fetch request
    const request = await HelpRequest.findById(data.helpRequestId);

    if (!request) throw new Error('HelpRequest not found');

    const reqItem = request.requirements.find(
      r => r._id.toString() === data.requirementId
    );

    if (!reqItem) throw new Error('Requirement not found');

    // 🧠 Calculate remaining
    const grantedDocs = await GrantedHelp.find({
      helpRequestId: data.helpRequestId,
      requirementId: data.requirementId
    });

    const totalGranted = grantedDocs.reduce(
      (sum, g) => sum + g.quantityApproved,
      0
    );

    const remaining = reqItem.quantity - totalGranted;

    if (safeQty > remaining) {
      throw new Error('Exceeds required quantity');
    }

    // ✅ Create grant
    const savedHelp = await GrantedHelp.create({
      ...data,
      quantityApproved: safeQty
    });

    // ✅ Push ONLY ObjectId (IMPORTANT FIX)
    await HelpRequest.findByIdAndUpdate(
      data.helpRequestId,
      {
        $push: {
          'requirements.$[elem].grantedList': savedHelp._id
        },
        $set: { status: 'in-progress' }
      },
      {
        arrayFilters: [{ 'elem._id': data.requirementId }],
        returnDocument: 'after'
      }
    );

    return savedHelp;
  }

  async getGrantedHelpById(id) {
    return await GrantedHelp.findById(id).populate('ngoId');
  }

  async getGrantedHelpByNGO(ngoId) {
    return await GrantedHelp.find({ ngoId })
      .populate('helpRequestId')
      .populate('ngoId');
  }

  async getGrantedHelpByRequest(helpRequestId) {
    return await GrantedHelp.find({ helpRequestId })
      .populate('ngoId');
  }

  async updateGrantedHelpStatus(id, status) {
    return await GrantedHelp.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }
}

export default new GrantedHelpRepository();