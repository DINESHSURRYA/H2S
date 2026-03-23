import mockData from './mockData.js';

class UserRepository {
  async getUser() {
    // Simulating a DB call
    return mockData.user;
  }
}

export default new UserRepository();
