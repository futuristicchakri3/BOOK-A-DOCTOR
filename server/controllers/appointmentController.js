const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient only)
 */
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;
    const patientId = req.user._id;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: 'Please provide doctorId, appointmentDate, and appointmentTime.' });
    }

    // Parse dates and validate that appointment is not in the past
    const bookDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookDate < today) {
      return res.status(400).json({ success: false, message: 'Cannot book appointments for past dates.' });
    }

    // Fetch doctor details
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Check doctor availability days
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bookedDayName = dayNames[bookDate.getDay()];
    
    const isDayAvailable = doctor.availableDays.some(
      (day) => day.toLowerCase() === bookedDayName.toLowerCase()
    );

    if (!isDayAvailable) {
      return res.status(400).json({
        success: false,
        message: `Doctor is not available on ${bookedDayName}. Available days: ${doctor.availableDays.join(', ')}`,
      });
    }

    // Check doctor availability slots
    const isSlotAvailable = doctor.availableSlots.some(
      (slot) => slot.trim() === appointmentTime.trim()
    );

    if (!isSlotAvailable) {
      return res.status(400).json({
        success: false,
        message: `Time slot ${appointmentTime} is not in the doctor's available hours.`,
      });
    }

    // Check for existing overlapping Approved or Pending appointments
    const existingOverlapping = await Appointment.findOne({
      doctorId,
      appointmentDate: bookDate,
      appointmentTime: appointmentTime.trim(),
      status: { $in: ['Pending', 'Approved'] },
    });

    if (existingOverlapping) {
      return res.status(400).json({
        success: false,
        message: 'This time slot has already been booked. Please choose another slot.',
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      doctorId,
      patientId,
      appointmentDate: bookDate,
      appointmentTime: appointmentTime.trim(),
      reason: reason || '',
      status: 'Pending',
    });

    // Notify patient
    await sendEmail({
      to: req.user.email,
      subject: 'Appointment Booked - Pending Confirmation',
      text: `Hello ${req.user.name},\n\nYour appointment with Dr. ${doctor.name} on ${bookDate.toDateString()} at ${appointmentTime} has been successfully requested. The doctor will review your booking shortly.\n\nThank you,\nBook A Doctor Team.`,
    });

    // Notify doctor
    const doctorUser = await User.findById(doctor.userId);
    if (doctorUser) {
      await sendEmail({
        to: doctorUser.email,
        subject: 'New Appointment Booking Request',
        text: `Hello Dr. ${doctor.name},\n\nYou have received a new appointment booking request from ${req.user.name} for ${bookDate.toDateString()} at ${appointmentTime}.\n\nPlease log in to your dashboard to Approve or Reject this request.\n\nThank you,\nBook A Doctor Team.`,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Appointment requested successfully.',
      data: appointment,
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get appointments for a specific Patient (User)
 * @route   GET /api/appointments/user/:id
 * @access  Private (Patient themselves, Doctor, or Admin)
 */
const getAppointmentsByUserId = async (req, res) => {
  try {
    const patientId = req.params.id;

    // Check auth permission
    if (
      req.user.role !== 'ADMIN' &&
      req.user.role !== 'DOCTOR' &&
      req.user._id.toString() !== patientId
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these appointments.' });
    }

    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'name specialization hospital consultationFee profileImage')
      .sort({ appointmentDate: -1, appointmentTime: 1 });

    return res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error('Get appointments by user error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get appointments for a Doctor by Doctor DB ID
 * @route   GET /api/appointments/doctor/:id
 * @access  Private (Doctor themselves or Admin)
 */
const getAppointmentsByDoctorId = async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Retrieve doctor document
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Verify auth permission
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== doctor.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these appointments.' });
    }

    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email phone gender age profilePic')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    return res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error('Get appointments by doctor error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update appointment status (Approve, Reject, Cancel, Complete)
 * @route   PUT /api/appointments/:id
 * @access  Private
 */
const updateAppointment = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Retrieve doctor profile to verify user
    const doctor = await Doctor.findById(appointment.doctorId);
    const doctorUser = doctor ? await User.findById(doctor.userId) : null;
    const patientUser = await User.findById(appointment.patientId);

    // Validate permission based on requested status action
    const isDoctor = req.user.role === 'DOCTOR' && req.user._id.toString() === doctor?.userId.toString();
    const isPatient = req.user.role === 'PATIENT' && req.user._id.toString() === appointment.patientId.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isDoctor && !isPatient && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this appointment.' });
    }

    // Validate Status Transitions
    if (status === 'Approved' || status === 'Rejected' || status === 'Completed') {
      if (!isDoctor && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only doctors or admins can approve, reject or complete appointments.' });
      }
    }

    if (status === 'Cancelled') {
      if (!isPatient && !isDoctor && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Unauthorized to cancel this appointment.' });
      }
    }

    appointment.status = status || appointment.status;
    appointment.reason = reason || appointment.reason;

    const updatedAppointment = await appointment.save();

    // Trigger email notifications
    if (status === 'Approved') {
      await sendEmail({
        to: patientUser.email,
        subject: 'Appointment Confirmed! - Book A Doctor',
        text: `Hello ${patientUser.name},\n\nGreat news! Your appointment with Dr. ${doctor.name} on ${new Date(appointment.appointmentDate).toDateString()} at ${appointment.appointmentTime} has been APPROVED by the doctor.\n\nThank you,\nBook A Doctor Team.`,
      });
    } else if (status === 'Rejected') {
      await sendEmail({
        to: patientUser.email,
        subject: 'Appointment Update - Booking Rejected',
        text: `Hello ${patientUser.name},\n\nWe regret to inform you that your appointment with Dr. ${doctor.name} on ${new Date(appointment.appointmentDate).toDateString()} at ${appointment.appointmentTime} has been rejected.\n\nReason: ${reason || 'Doctor unavailable.'}\n\nPlease try booking another time slot or searching for another doctor.\n\nThank you,\nBook A Doctor Team.`,
      });
    } else if (status === 'Cancelled') {
      // Notify doctor if patient cancelled, or patient if doctor/admin cancelled
      const canceler = isPatient ? 'Patient' : 'Doctor/Admin';
      const receiverEmail = isPatient ? doctorUser?.email : patientUser.email;
      const receiverName = isPatient ? `Dr. ${doctor.name}` : patientUser.name;

      if (receiverEmail) {
        await sendEmail({
          to: receiverEmail,
          subject: 'Appointment Cancelled - Book A Doctor',
          text: `Hello ${receiverName},\n\nWe wanted to let you know that the appointment scheduled on ${new Date(appointment.appointmentDate).toDateString()} at ${appointment.appointmentTime} has been CANCELLED by the ${canceler}.\n\nReason: ${reason || 'N/A'}\n\nThank you,\nBook A Doctor Team.`,
        });
      }
    }

    return res.json({
      success: true,
      message: `Appointment status updated to ${status}.`,
      data: updatedAppointment,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete/Cancel appointment (Admin delete capability)
 * @route   DELETE /api/appointments/:id
 * @access  Private (Admin only)
 */
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only administrators can delete appointments.' });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    return res.json({
      success: true,
      message: 'Appointment deleted successfully from database record.',
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  bookAppointment,
  getAppointmentsByUserId,
  getAppointmentsByDoctorId,
  updateAppointment,
  deleteAppointment,
};
