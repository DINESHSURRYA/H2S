import profileService from '../services/profileService.js';
import { success } from '../utils/response.js';

class ProfileController {
  getProfile = async (req, res, next) => {
    try {
      const profileData = await profileService.getProfileData();
      return success(res, profileData, "Profile fetched successfully");
    } catch (error) {
      next(error);
    }
  };
}

export default new ProfileController();
