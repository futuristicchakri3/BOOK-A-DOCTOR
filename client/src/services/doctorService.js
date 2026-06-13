import axios from 'axios';

/**
 * Fetch all approved doctors with parameters
 * @param {Object} params - { search, specialization, maxFee, minExperience, minRating, page, limit }
 */
export const getDoctors = async (params) => {
  const response = await axios.get('/api/doctors', { params });
  return response.data;
};

/**
 * Fetch detailed doctor profile by ID
 * @param {string} id 
 */
export const getDoctorById = async (id) => {
  const response = await axios.get(`/api/doctors/${id}`);
  return response.data;
};

/**
 * Update doctor profile settings
 * @param {string} id 
 * @param {Object} data 
 */
export const updateDoctor = async (id, data) => {
  const response = await axios.put(`/api/doctors/${id}`, data);
  return response.data;
};
