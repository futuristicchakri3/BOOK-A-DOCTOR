const User = require('../models/User');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey12345!@#', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user (Patient or Doctor)
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, gender, age, role, specialization, qualification, experience, hospital, consultationFee, availableDays, availableSlots, about } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // Password validation: 8 chars, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    // Determine role (default to PATIENT)
    const userRole = role && ['PATIENT', 'DOCTOR', 'ADMIN'].includes(role.toUpperCase()) ? role.toUpperCase() : 'PATIENT';

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      phone,
      gender,
      age,
      role: userRole,
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Failed to create user.' });
    }

    // If registering as DOCTOR, create the Doctor entry
    if (userRole === 'DOCTOR') {
      await Doctor.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        specialization: specialization || 'General Medicine',
        qualification: qualification || 'MBBS',
        experience: experience || 0,
        hospital: hospital || 'General Hospital',
        consultationFee: consultationFee || 0,
        availableDays: availableDays || [],
        availableSlots: availableSlots || [],
        about: about || '',
        isApproved: false, // Must be approved by admin
      });
    }

    // Send confirmation email
    const emailSubject = 'Welcome to Book A Doctor!';
    const emailText = `Hello ${user.name},\n\nYour account has been successfully registered as a ${user.role}.\n\n${
      user.role === 'DOCTOR'
        ? 'Since you registered as a Doctor, your profile is currently PENDING admin approval. Once approved, patients will be able to book sessions with you.'
        : 'You can now browse doctors, check slot availability, and book appointments!'
    }\n\nThank you,\nBook A Doctor Team.`;

    await sendEmail({
      to: user.email,
      subject: emailSubject,
      text: emailText,
    });

    return res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePic: user.profilePic,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // If doctor, fetch approval status
      let isApproved = true;
      if (user.role === 'DOCTOR') {
        const doctorProfile = await Doctor.findOne({ userId: user._id });
        if (doctorProfile) {
          isApproved = doctorProfile.isApproved;
        }
      }

      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          gender: user.gender,
          age: user.age,
          profilePic: user.profilePic,
          isApproved,
          token: generateToken(user._id),
        },
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let extraDetails = {};
    if (user.role === 'DOCTOR') {
      const doc = await Doctor.findOne({ userId: user._id });
      if (doc) {
        extraDetails = doc;
      }
    }

    return res.json({
      success: true,
      data: {
        user,
        doctorDetails: user.role === 'DOCTOR' ? extraDetails : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user base fields
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender || user.gender;
    user.age = req.body.age !== undefined ? req.body.age : user.age;
    user.profilePic = req.body.profilePic || user.profilePic;

    if (req.body.password) {
      // Verify password constraints
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
      if (!passwordRegex.test(req.body.password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.',
        });
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    // If user is a Doctor, update matching Doctor doc details as well
    if (user.role === 'DOCTOR') {
      const doc = await Doctor.findOne({ userId: user._id });
      if (doc) {
        doc.name = user.name;
        doc.specialization = req.body.specialization || doc.specialization;
        doc.qualification = req.body.qualification || doc.qualification;
        doc.experience = req.body.experience !== undefined ? req.body.experience : doc.experience;
        doc.hospital = req.body.hospital || doc.hospital;
        doc.consultationFee = req.body.consultationFee !== undefined ? req.body.consultationFee : doc.consultationFee;
        doc.availableDays = req.body.availableDays || doc.availableDays;
        doc.availableSlots = req.body.availableSlots || doc.availableSlots;
        doc.about = req.body.about || doc.about;
        doc.profileImage = user.profilePic;
        await doc.save();
      }
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        age: updatedUser.age,
        role: updatedUser.role,
        profilePic: updatedUser.profilePic,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
};
