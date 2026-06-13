import axios from 'axios';

/**
 * Fetch current user profile details
 */
export const getProfile = async () => {
  const response = await axios.get('/api/auth/profile');
  return response.data;
};

/**
 * Update current user profile details
 * @param {Object} profileData 
 */
export const updateProfile = async (profileData) => {
  const response = await axios.put('/api/auth/profile', profileData);
  return response.data;
};
