const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  registerDoctorProfile,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');
const { protect } = require('../middlewares/authMiddleware');
const { admin } = require('../middlewares/adminMiddleware');

router.route('/')
  .get(getDoctors);

router.post('/register', registerDoctorProfile);

router.route('/:id')
  .get(getDoctorById)
  .put(protect, updateDoctor)
  .delete(protect, admin, deleteDoctor);

module.exports = router;
