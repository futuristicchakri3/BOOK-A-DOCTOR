import axios from 'axios';

/**
 * Patient requests a new doctor slot booking
 * @param {Object} data - { doctorId, appointmentDate, appointmentTime, reason }
 */
export const bookAppointment = async (data) => {
  const response = await axios.post('/api/appointments', data);
  return response.data;
};

/**
 * Fetch appointments for a patient
 * @param {string} userId 
 */
export const getAppointmentsByUser = async (userId) => {
  const response = await axios.get(`/api/appointments/user/${userId}`);
  return response.data;
};

/**
 * Fetch appointments for a doctor
 * @param {string} doctorId 
 */
export const getAppointmentsByDoctor = async (doctorId) => {
  const response = await axios.get(`/api/appointments/doctor/${doctorId}`);
  return response.data;
};

/**
 * Doctor/Patient updates booking state (Approve, Reject, Cancel, Complete)
 * @param {string} id 
 * @param {Object} statusData - { status, reason }
 */
export const updateAppointmentStatus = async (id, statusData) => {
  const response = await axios.put(`/api/appointments/${id}`, statusData);
  return response.data;
};
