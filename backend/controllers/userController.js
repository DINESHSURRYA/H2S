import userService from '../services/userService.js';
import { success } from '../utils/response.js';

class UserController {
  getUser = async (req, res, next) => {
    try {
      const userData = await userService.getUserData();
      return success(res, userData, "User fetched successfully");
    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();
