const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    npi: {
      type: Number,
      unique: true,
      sparse: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Experience is required'],
    },
    hospital: {
      type: String,
      required: [true, 'Hospital is required'],
      trim: true,
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Fee cannot be negative'],
    },
    profileImage: {
      type: String,
      default: '',
    },
    availableDays: {
      type: [String], // e.g. ['Monday', 'Wednesday', 'Friday']
      default: [],
    },
    availableSlots: {
      type: [String], // e.g. ['09:00 AM', '10:00 AM', '02:00 PM']
      default: [],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    about: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add text indexes for search queries
doctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);
