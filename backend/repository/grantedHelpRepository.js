import GrantedHelp from '../models/grantedHelpModel.js';

class GrantedHelpRepository {
  async createGrant(data) {
    return await GrantedHelp.create(data);
  }

  async findByRequestAndRequirement(helpRequestId, requirementId) {
    return await GrantedHelp.find({ helpRequestId, requirementId });
  }

  async getGrantedHelpById(id) {
    return await GrantedHelp.findById(id).populate('ngoId', '-password');
  }

  async getGrantedHelpByNGO(ngoId) {
    return await GrantedHelp.find({ ngoId })
      .populate('helpRequestId')
      .populate('ngoId', '-password')
      .sort({ createdAt: -1 });
  }

  async getGrantedHelpByRequest(helpRequestId) {
    return await GrantedHelp.find({ helpRequestId })
      .populate('ngoId', '-password')
      .sort({ createdAt: -1 });
  }

  async updateGrantedHelpStatus(id, status) {
    return await GrantedHelp.findByIdAndUpdate(id, { $set: { status } }, { returnDocument: 'after' });
  }

  async markAsReceived(id) {
    return await GrantedHelp.findByIdAndUpdate(
      id,
      { $set: { isReceived: true, status: 'fulfilled' } },
      { returnDocument: 'after' }
    );
  }

  async getNgoAggregateStats(ngoId) {
    const grants = await GrantedHelp.find({ ngoId, status: { $ne: 'cancelled' } });
    const missionSet = new Set(grants.map((g) => g.helpRequestId?.toString()).filter(Boolean));
    const totalUnits = grants.reduce((sum, g) => sum + (Number(g.quantityApproved) || 0), 0);
    const confirmedDeliveries = grants.filter((g) => g.isReceived).length;

    return {
      missionsSupported: missionSet.size,
      totalGrants: grants.length,
      totalUnitsAllocated: totalUnits,
      confirmedDeliveries,
    };
  }

  async getGlobalGrantStats() {
    const grants = await GrantedHelp.find({ status: { $ne: 'cancelled' } });
    const totalUnits = grants.reduce((sum, g) => sum + (Number(g.quantityApproved) || 0), 0);
    const deliveredCount = grants.filter((g) => g.isReceived).length;
    return {
      totalGrants: grants.length,
      totalUnitsAllocated: totalUnits,
      deliveredCount,
    };
  }
}

export default new GrantedHelpRepository();
