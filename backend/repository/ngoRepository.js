import Ngo from '../models/ngoModel.js';

class NgoRepository {
  async createNgo(ngoData) {
    const ngo = new Ngo(ngoData);
    return await ngo.save();
  }

  async findNgoByEmail(email) {
    return await Ngo.findOne({ email: email?.toLowerCase().trim() });
  }

  async findNgoById(id) {
    return await Ngo.findById(id).select('-password');
  }

  async updateNgoStatus(id, status) {
    const isVerified = status === 'active';
    return await Ngo.findByIdAndUpdate(
      id,
      { $set: { status, isVerified } },
      { returnDocument: 'after' }
    ).select('-password');
  }

  async incrementTrustScore(id, delta) {
    return await Ngo.findByIdAndUpdate(
      id,
      { $inc: { trustScore: delta } },
      { returnDocument: 'after' }
    ).select('-password');
  }

  async getAllNgos() {
    return await Ngo.find({}).select('-password').sort({ createdAt: -1 });
  }

  async getCounts() {
    const [total, active, pending, suspended] = await Promise.all([
      Ngo.countDocuments(),
      Ngo.countDocuments({ status: 'active' }),
      Ngo.countDocuments({ status: 'pending' }),
      Ngo.countDocuments({ status: 'suspended' }),
    ]);
    return { total, active, pending, suspended };
  }
}

export default new NgoRepository();
