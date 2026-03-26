import GrantedHelp from '../models/grantedHelpModel.js';
import HelpRequest from '../models/helpRequestModel.js';

class GrantedHelpRepository {
  async createGrantedHelp(data) {
    const grantedHelp = new GrantedHelp(data);
    const savedHelp = await grantedHelp.save();

    // Update the HelpRequest to include this in the grantedList and set status to in-progress
    await HelpRequest.findByIdAndUpdate(
      data.helpRequestId,
      { 
        $push: { 'requirements.$[elem].grantedList': savedHelp._id },
        $set: { status: 'in-progress' }
      },
      { 
        arrayFilters: [{ 'elem._id': data.requirementId }],
        new: true 
      }
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
