import Admin from '../models/adminModel.js';

class AdminRepository {
  async findAdminByEmail(email) {
    return await Admin.findOne({ email });
  }

  async findAdminById(id) {
    return await Admin.findById(id).select('-password');
  }

  async createAdmin(adminData) {
    const admin = new Admin(adminData);
    return await admin.save();
  }
}

export default new AdminRepository();
