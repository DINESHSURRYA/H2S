import userRepository from '../repository/userRepository.js';

class UserService {
  getUserData = async () => {
    const user = await userRepository.getUser();
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return user;
  };
}

export default new UserService();
