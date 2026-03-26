import GrantedHelp from '../models/grantedHelpModel.js';
import HelpRequest from '../models/helpRequestModel.js';

class GrantedHelpRepository {
  async createGrantedHelp(data) {
    const grantedHelp = new GrantedHelp(data);
    const savedHelp = await grantedHelp.save();

    // Update the HelpRequest to include this in the grantedList of the specific requirement
    await HelpRequest.findOneAndUpdate(
      { _id: data.helpRequestId, 'requirements._id': data.requirementId },
      { $push: { 'requirements.$.grantedList': savedHelp._id } },
      { new: true }
    );

    return savedHelp;
  }

  async getGrantedHelpById(id) {
    return await GrantedHelp.findById(id).populate('ngoId');
  }

  async getGrantedHelpByNGO(ngoId) {
    return await GrantedHelp.find({ ngoId }).populate('helpRequestId');
  }

  async getGrantedHelpByRequest(helpRequestId) {
    return await GrantedHelp.find({ helpRequestId }).populate('ngoId');
  }

  async updateGrantedHelpStatus(id, status) {
    return await GrantedHelp.findByIdAndUpdate(id, { status }, { new: true });
  }
}

export default new GrantedHelpRepository();
