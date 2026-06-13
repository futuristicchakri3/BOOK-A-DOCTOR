const express = require('express');
const router = express.Router();
const {
  getUsers,
  getDoctors,
  approveDoctor,
  deleteUser,
  deleteDoctor,
  getAnalytics,
  getAppointments,
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { admin } = require('../middlewares/adminMiddleware');

// Secure all routes with authentication and admin verification
router.use(protect);
router.use(admin);

router.get('/users', getUsers);
router.get('/doctors', getDoctors);
router.put('/approveDoctor/:id', approveDoctor);
router.delete('/user/:id', deleteUser);
router.delete('/doctor/:id', deleteDoctor);
router.get('/analytics', getAnalytics);
router.get('/appointments', getAppointments);

module.exports = router;
