const express = require('express');
const router = express.Router();
const { uploadReport, getReportsByPatient, deleteReport } = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/cloudinary');

router.post('/upload', protect, upload.single('file'), uploadReport);
router.get('/:patientId', protect, getReportsByPatient);
router.delete('/:id', protect, deleteReport);

module.exports = router;
