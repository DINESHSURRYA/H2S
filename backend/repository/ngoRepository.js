import Ngo from '../models/ngoModel.js';

class NgoRepository {
  async createNgo(ngoData) {
    const ngo = new Ngo(ngoData);
    return await ngo.save();
  }

  async findNgoByEmail(email) {
    return await Ngo.findOne({ email });
  }

  async findNgoById(id) {
    return await Ngo.findById(id).select('-password');
  }

  async updateNgoStatus(id, status) {
    return await Ngo.findByIdAndUpdate(id, { status }, { new: true });
  }

  async getAllNgos() {
    return await Ngo.find({}).sort({ createdAt: -1 });
  }
}

export default new NgoRepository();
