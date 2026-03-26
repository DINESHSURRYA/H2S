import PublicUser from '../models/publicUserModel.js';

class PublicUserRepository {
  async findOrCreate(data) {
    let user = await PublicUser.findOne({ phone: data.phone });
    if (!user) {
      user = new PublicUser(data);
      await user.save();
    }
    return user;
  }
}

export default new PublicUserRepository();
