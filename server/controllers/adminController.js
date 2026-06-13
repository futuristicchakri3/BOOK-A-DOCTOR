const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const sendEmail = require('../utils/sendEmail');

/**
 * @desc    Get all patient users
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'PATIENT' }).select('-password').sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Admin getUsers error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all doctors (approved and pending)
 * @route   GET /api/admin/doctors
 * @access  Private (Admin only)
 */
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).sort({ isApproved: 1, createdAt: -1 });
    return res.json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    console.error('Admin getDoctors error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Approve/Reject a doctor registration
 * @route   PUT /api/admin/approveDoctor/:id
 * @access  Private (Admin only)
 */
const approveDoctor = async (req, res) => {
  try {
    const { isApproved } = req.body; // true to approve, false to reject/disable
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    doctor.isApproved = isApproved;
    await doctor.save();

    // Fetch doctor's user email
    const doctorUser = await User.findById(doctor.userId);
    if (doctorUser) {
      const emailSubject = isApproved ? 'Profile Approved! - Book A Doctor' : 'Profile Update - Book A Doctor';
      const emailText = isApproved
        ? `Hello Dr. ${doctor.name},\n\nYour profile has been APPROVED by the admin! You are now visible on the patient directory, and patients can start booking appointments with you.\n\nThank you,\nBook A Doctor Team.`
        : `Hello Dr. ${doctor.name},\n\nYour profile approval status has been updated. It is currently set to pending/rejected.\n\nPlease reach out to administrator support for more details.\n\nThank you,\nBook A Doctor Team.`;

      await sendEmail({
        to: doctorUser.email,
        subject: emailSubject,
        text: emailText,
      });
    }

    return res.json({
      success: true,
      message: `Doctor registration status updated to: ${isApproved ? 'Approved' : 'Pending/Rejected'}.`,
      data: doctor,
    });
  } catch (error) {
    console.error('Approve doctor error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a patient user
 * @route   DELETE /api/admin/user/:id
 * @access  Private (Admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin users.' });
    }

    // Delete all associated appointments
    await Appointment.deleteMany({ patientId: user._id });

    // Delete User record
    await User.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Patient user and their scheduled appointments have been deleted successfully.',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a doctor profile & user account
 * @route   DELETE /api/admin/doctor/:id
 * @access  Private (Admin only)
 */
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    // Delete appointments associated with doctor
    await Appointment.deleteMany({ doctorId: doctor._id });

    // Delete User record
    await User.findByIdAndDelete(doctor.userId);

    // Delete Doctor record
    await Doctor.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Doctor, linked user account, and scheduled appointments deleted successfully.',
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/admin/analytics
 * @access  Private (Admin only)
 */
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'PATIENT' });
    const totalDoctors = await Doctor.countDocuments({});
    const totalAppointments = await Appointment.countDocuments({});

    // Calculate revenue (Consultation fees of Approved or Completed bookings)
    const approvedBookings = await Appointment.find({
      status: { $in: ['Approved', 'Completed'] },
    }).populate('doctorId');

    let totalRevenue = 0;
    approvedBookings.forEach((app) => {
      if (app.doctorId && app.doctorId.consultationFee) {
        totalRevenue += app.doctorId.consultationFee;
      }
    });

    // Specializations breakdown
    const specializations = await Doctor.aggregate([
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Monthly Trends for past 6 months
    const monthlyTrends = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-indexed

      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

      // Bookings in this month range
      const appointmentsCount = await Appointment.countDocuments({
        appointmentDate: { $gte: startOfMonth, $lte: endOfMonth },
      });

      // Revenue in this month range
      const monthBookings = await Appointment.find({
        appointmentDate: { $gte: startOfMonth, $lte: endOfMonth },
        status: { $in: ['Approved', 'Completed'] },
      }).populate('doctorId');

      let monthRevenue = 0;
      monthBookings.forEach((app) => {
        if (app.doctorId && app.doctorId.consultationFee) {
          monthRevenue += app.doctorId.consultationFee;
        }
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthlyTrends.push({
        month: monthNames[month],
        appointments: appointmentsCount,
        revenue: monthRevenue,
      });
    }

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        totalAppointments,
        totalRevenue,
        specializations,
        monthlyTrends,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization hospital')
      .sort({ appointmentDate: -1, appointmentTime: 1 });
    return res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Admin getAppointments error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  getDoctors,
  approveDoctor,
  deleteUser,
  deleteDoctor,
  getAnalytics,
  getAppointments,
};
