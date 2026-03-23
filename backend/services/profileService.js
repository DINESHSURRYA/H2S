import profileRepository from '../repository/profileRepository.js';

class ProfileService {
  getProfileData = async () => {
    const profile = await profileRepository.getProfile();
    if (!profile) {
      const error = new Error("Profile not found");
      error.statusCode = 404;
      throw error;
    }
    return profile;
  };
}

export default new ProfileService();
