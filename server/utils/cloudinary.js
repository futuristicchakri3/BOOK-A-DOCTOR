const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if keys exist
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.log('Cloudinary not configured. File uploads will fall back to local server storage.');
}

// Multer Storage Configuration (for local server or temporary upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter (images & PDFs allowed)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files (JPG, JPEG, PNG) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * Uploads a file to Cloudinary or returns the local server URL as a fallback.
 * @param {string} localFilePath - Path of the file on local storage
 * @returns {Promise<{ url: string, public_id?: string }>}
 */
const uploadToCloudinary = async (localFilePath) => {
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: 'book_a_doctor_reports',
        resource_type: 'auto',
      });
      // Delete temporary file after successful cloud upload
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error('Error removing local temp file:', err);
      }
      return { url: result.secure_url, public_id: result.public_id };
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      // Fallback to serving the local file if Cloudinary fails
    }
  }

  // Fallback: Return server path
  const filename = path.basename(localFilePath);
  // We return a path prefix that the server will serve statically
  const fileUrl = `/uploads/${filename}`;
  return { url: fileUrl };
};

module.exports = {
  upload,
  uploadToCloudinary,
  isCloudinaryConfigured
};
