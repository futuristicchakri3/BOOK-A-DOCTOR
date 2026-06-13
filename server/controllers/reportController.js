const Report = require('../models/Report');
const Doctor = require('../models/Doctor');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary } = require('../utils/cloudinary');

/**
 * @desc    Upload a new medical report
 * @route   POST /api/reports/upload
 * @access  Private (Patient only)
 */
const uploadReport = async (req, res) => {
  try {
    const { doctorId, fileName } = req.body;
    const patientId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file (PDF, JPG, JPEG, PNG).' });
    }

    if (!doctorId) {
      // Clean up the uploaded local file if doctorId is missing
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, message: 'Please specify doctorId for the report.' });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Upload to Cloudinary (falls back to local filesystem if credentials not present)
    const uploadResult = await uploadToCloudinary(req.file.path);

    // Save report metadata to DB
    const report = await Report.create({
      patientId,
      doctorId,
      fileURL: uploadResult.url,
      fileName: fileName || req.file.originalname,
      fileType: path.extname(req.file.originalname).substring(1).toUpperCase() || 'UNKNOWN',
    });

    return res.status(201).json({
      success: true,
      message: 'Medical report uploaded successfully.',
      data: report,
    });
  } catch (error) {
    console.error('Upload report error:', error);
    // Cleanup files in case of exceptions
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get reports for a specific Patient
 * @route   GET /api/reports/:patientId
 * @access  Private (Patient themselves, doctor they book, or admin)
 */
const getReportsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check authority: user must be the patient, a doctor, or an admin
    if (
      req.user.role !== 'ADMIN' &&
      req.user.role !== 'DOCTOR' &&
      req.user._id.toString() !== patientId
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to access these reports.' });
    }

    const reports = await Report.find({ patientId })
      .populate('doctorId', 'name specialization hospital')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a medical report
 * @route   DELETE /api/reports/:id
 * @access  Private (Patient who uploaded it, or Admin)
 */
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Verify authority
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== report.patientId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this report.' });
    }

    // Try deleting local file if it's served locally
    if (report.fileURL.startsWith('/uploads/')) {
      const localPath = path.join(__dirname, '..', report.fileURL);
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
        } catch (err) {
          console.error('Failed to delete local report file:', err);
        }
      }
    }

    await Report.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Report deleted successfully.',
    });
  } catch (error) {
    console.error('Delete report error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadReport,
  getReportsByPatient,
  deleteReport,
};
