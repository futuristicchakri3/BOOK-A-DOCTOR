const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointmentsByUserId,
  getAppointmentsByDoctorId,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middlewares/authMiddleware');
const { admin } = require('../middlewares/adminMiddleware');

router.route('/')
  .post(protect, bookAppointment);

router.route('/user/:id')
  .get(protect, getAppointmentsByUserId);

router.route('/doctor/:id')
  .get(protect, getAppointmentsByDoctorId);

router.route('/:id')
  .put(protect, updateAppointment)
  .delete(protect, admin, deleteAppointment);

module.exports = router;
