import mockData from './mockData.js';

class ProfileRepository {
  async getProfile() {
    // Simulating a DB call
    return mockData.profile;
  }
}

export default new ProfileRepository();
