const Doctor = require('../models/Doctor');
const User = require('../models/User');

/**
 * @desc    Get all approved doctors with optional search, filters and pagination
 * @route   GET /api/doctors
 * @access  Public
 */
const getDoctors = async (req, res) => {
  try {
    const { search, specialization, maxFee, minExperience, minRating, page = 1, limit = 10 } = req.query;

    // Fetch and Sync from doctorsapi.com if API key is configured
    const apiKey = process.env.DOCTORS_API_KEY;
    const apiUrl = process.env.DOCTORS_API_URL || 'https://doctorsapi.com/api/doctors';

    if (apiKey) {
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('name', search);
        if (specialization) queryParams.append('specialty', specialization);
        queryParams.append('limit', '25');

        const url = `${apiUrl}?${queryParams.toString()}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result && result.doctors && Array.isArray(result.doctors)) {
            for (const extDoc of result.doctors) {
              if (!extDoc.npi) continue;

              // Find or create shadow User account
              const email = `doctor.${extDoc.npi}@doctorsapi.com`;
              let user = await User.findOne({ email });
              if (!user) {
                user = await User.create({
                  name: extDoc.name || 'Dr. External Provider',
                  email,
                  password: 'Password123!', // Placeholder safe password
                  phone: extDoc.phone || '',
                  gender: extDoc.gender === 'F' ? 'Female' : extDoc.gender === 'M' ? 'Male' : 'Other',
                  age: 40,
                  role: 'DOCTOR',
                  profilePic: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
                });
              }

              // Map properties
              const qualification = Array.isArray(extDoc.credentials)
                ? extDoc.credentials.join(', ')
                : extDoc.credentials || 'MBBS, MD';
              let hospital = 'General Hospital';
              if (extDoc.address) {
                if (extDoc.address.city) {
                  hospital = `${extDoc.address.city} Healthcare Clinic`;
                } else if (extDoc.address.firstLine) {
                  hospital = `${extDoc.address.firstLine} Clinic`;
                }
              }
              const spec = (extDoc.specialties && extDoc.specialties[0]) || 'General Medicine';

              // Upsert doctor profile linked to user
              await Doctor.findOneAndUpdate(
                { npi: extDoc.npi },
                {
                  userId: user._id,
                  name: extDoc.name || user.name,
                  email: user.email,
                  npi: extDoc.npi,
                  specialization: spec,
                  qualification: qualification,
                  experience: 10,
                  hospital: hospital,
                  consultationFee: 120,
                  profileImage: user.profilePic,
                  availableDays: ['Monday', 'Wednesday', 'Friday'],
                  availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
                  isApproved: true,
                  about: `Verified practitioner registered with NPI ${extDoc.npi}. Available for consults via Book A Doctor portal.`
                },
                { upsert: true, new: true }
              );
            }
          }
        }
      } catch (err) {
        console.error('Failed to sync from Doctors API:', err.message);
      }
    }

    // Build query
    const query = { isApproved: true };

    // Search by text (name, specialization, hospital)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { hospital: { $regex: search, $options: 'i' } },
      ];
    }

    // Specialization Filter
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    // Consultation Fee Filter (less than or equal to maxFee)
    if (maxFee) {
      query.consultationFee = { $lte: Number(maxFee) };
    }

    // Experience Filter (greater than or equal to minExperience)
    if (minExperience) {
      query.experience = { $gte: Number(minExperience) };
    }

    // Rating Filter (greater than or equal to minRating)
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Pagination calculations
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: doctors.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
      data: doctors,
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get a single doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'phone gender age profilePic');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    return res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error('Get doctor by ID error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Register a new Doctor profile (Alternative POST route)
 * @route   POST /api/doctors/register
 * @access  Public
 */
const registerDoctorProfile = async (req, res) => {
  try {
    const { name, email, password, phone, gender, age, specialization, qualification, experience, hospital, consultationFee, availableDays, availableSlots, about } = req.body;

    // Standard User registration check
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists.' });
    }

    // Create Base User
    const user = await User.create({
      name,
      email,
      password,
      phone,
      gender,
      age,
      role: 'DOCTOR',
    });

    // Create linked Doctor details
    const doctor = await Doctor.create({
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
      isApproved: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Doctor profile registered successfully and pending admin approval.',
      data: doctor,
    });
  } catch (error) {
    console.error('Doctor profile registration error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update doctor profile
 * @route   PUT /api/doctors/:id
 * @access  Private (Doctor themselves or Admin)
 */
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    // Check authority: user must be the owner doctor, or an admin
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== doctor.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this profile.' });
    }

    // Update doctor record
    doctor.specialization = req.body.specialization || doctor.specialization;
    doctor.qualification = req.body.qualification || doctor.qualification;
    doctor.experience = req.body.experience !== undefined ? Number(req.body.experience) : doctor.experience;
    doctor.hospital = req.body.hospital || doctor.hospital;
    doctor.consultationFee = req.body.consultationFee !== undefined ? Number(req.body.consultationFee) : doctor.consultationFee;
    doctor.availableDays = req.body.availableDays || doctor.availableDays;
    doctor.availableSlots = req.body.availableSlots || doctor.availableSlots;
    doctor.about = req.body.about || doctor.about;
    doctor.profileImage = req.body.profileImage || doctor.profileImage;

    // Admin-only updates
    if (req.user.role === 'ADMIN') {
      doctor.isApproved = req.body.isApproved !== undefined ? req.body.isApproved : doctor.isApproved;
    }

    const updatedDoctor = await doctor.save();

    // Sync user details if user profile picture changed
    const linkedUser = await User.findById(doctor.userId);
    if (linkedUser) {
      if (req.body.profileImage) {
        linkedUser.profilePic = req.body.profileImage;
      }
      linkedUser.name = req.body.name || linkedUser.name;
      linkedUser.phone = req.body.phone || linkedUser.phone;
      linkedUser.gender = req.body.gender || linkedUser.gender;
      linkedUser.age = req.body.age !== undefined ? req.body.age : linkedUser.age;
      await linkedUser.save();
    }

    return res.json({
      success: true,
      message: 'Doctor profile updated successfully.',
      data: updatedDoctor,
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete Doctor profile (Admin only)
 * @route   DELETE /api/doctors/:id
 * @access  Private (Admin only)
 */
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    // Delete linked User account
    await User.findByIdAndDelete(doctor.userId);
    // Delete doctor account
    await Doctor.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Doctor and associated user account deleted successfully.',
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  registerDoctorProfile,
  updateDoctor,
  deleteDoctor,
};
