require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Report = require('../models/Report');

const seedData = async () => {
  try {
    // Connect to DB
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/book_a_doctor';
    await mongoose.connect(connStr);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await Report.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Seed Admin
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@doctor.com',
      password: 'Password123', // Encrypted by pre-save hooks
      phone: '+1 800 555 0199',
      gender: 'Male',
      age: 35,
      role: 'ADMIN',
      profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    });
    console.log('Seeded Admin account (admin@doctor.com)');

    // 2. Seed Patients
    const patient1 = await User.create({
      name: 'John Doe',
      email: 'john@patient.com',
      password: 'Password123',
      phone: '+1 555 0101',
      gender: 'Male',
      age: 28,
      role: 'PATIENT',
      profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    });

    const patient2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@patient.com',
      password: 'Password123',
      phone: '+1 555 0102',
      gender: 'Female',
      age: 32,
      role: 'PATIENT',
      profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    });

    const patient3 = await User.create({
      name: 'Bob Johnson',
      email: 'bob@patient.com',
      password: 'Password123',
      phone: '+1 555 0103',
      gender: 'Other',
      age: 45,
      role: 'PATIENT',
      profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    });
    console.log('Seeded 3 Patient accounts.');

    // 3. Seed Doctors
    // Doctor 1: Approved Cardiologist
    const docUser1 = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'sarah@doctor.com',
      password: 'Password123',
      phone: '+1 555 0201',
      gender: 'Female',
      age: 42,
      role: 'DOCTOR',
      profilePic: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    });

    const doctor1 = await Doctor.create({
      userId: docUser1._id,
      name: docUser1.name,
      email: docUser1.email,
      specialization: 'Cardiology',
      qualification: 'MD - Cardiology, MBBS',
      experience: 12,
      hospital: 'Metro Cardiac Center',
      consultationFee: 150,
      profileImage: docUser1.profilePic,
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      availableSlots: ['09:00 AM', '10:00 AM', '02:00 PM', '03:00 PM'],
      isApproved: true,
      rating: 4.8,
      about: 'Dr. Sarah Jenkins is an experienced Cardiologist specialized in preventative cardiology and diagnostic cardiac imaging with over 12 years of clinical practice.',
    });

    // Doctor 2: Approved Dermatologist
    const docUser2 = await User.create({
      name: 'Dr. Michael Chen',
      email: 'michael@doctor.com',
      password: 'Password123',
      phone: '+1 555 0202',
      gender: 'Male',
      age: 38,
      role: 'DOCTOR',
      profilePic: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    });

    const doctor2 = await Doctor.create({
      userId: docUser2._id,
      name: docUser2.name,
      email: docUser2.email,
      specialization: 'Dermatology',
      qualification: 'MD - Dermatology, MBBS',
      experience: 8,
      hospital: 'Skin & Aesthetics Clinic',
      consultationFee: 100,
      profileImage: docUser2.profilePic,
      availableDays: ['Tuesday', 'Thursday'],
      availableSlots: ['10:00 AM', '11:00 AM', '01:00 PM', '04:00 PM'],
      isApproved: true,
      rating: 4.6,
      about: 'Dr. Michael Chen is specialized in clinical and aesthetic dermatology, treating complex skin conditions, acne, eczema, and skin cancer screenings.',
    });

    // Doctor 3: Pending Pediatrician
    const docUser3 = await User.create({
      name: 'Dr. Emily Taylor',
      email: 'emily@doctor.com',
      password: 'Password123',
      phone: '+1 555 0203',
      gender: 'Female',
      age: 31,
      role: 'DOCTOR',
      profilePic: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200',
    });

    const doctor3 = await Doctor.create({
      userId: docUser3._id,
      name: docUser3.name,
      email: docUser3.email,
      specialization: 'Pediatrics',
      qualification: 'DCH, MBBS',
      experience: 5,
      hospital: 'Children First Care',
      consultationFee: 80,
      profileImage: docUser3.profilePic,
      availableDays: ['Monday', 'Tuesday', 'Wednesday'],
      availableSlots: ['09:00 AM', '11:00 AM', '03:00 PM'],
      isApproved: false, // PENDING approval
      rating: 4.5,
      about: 'Dr. Emily Taylor is dedicated to comprehensive medical care for infants, children, and adolescents, ensuring optimal growth and developmental health.',
    });

    // Doctor 4: Pending Orthopedic
    const docUser4 = await User.create({
      name: 'Dr. James Wilson',
      email: 'james@doctor.com',
      password: 'Password123',
      phone: '+1 555 0204',
      gender: 'Male',
      age: 46,
      role: 'DOCTOR',
      profilePic: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
    });

    const doctor4 = await Doctor.create({
      userId: docUser4._id,
      name: docUser4.name,
      email: docUser4.email,
      specialization: 'Orthopedics',
      qualification: 'MS - Ortho, MBBS',
      experience: 16,
      hospital: 'Bone & Joint Institute',
      consultationFee: 180,
      profileImage: docUser4.profilePic,
      availableDays: ['Thursday', 'Friday'],
      availableSlots: ['11:00 AM', '02:00 PM', '04:00 PM'],
      isApproved: false, // PENDING approval
      rating: 4.9,
      about: 'Dr. James Wilson specializes in reconstructive orthopedic surgery, sports medicine, joint replacements, and complex trauma management.',
    });
    console.log('Seeded 4 Doctor profiles (2 approved, 2 pending approval).');

    // 4. Seed Appointments
    // App 1: Pending (John with Dr. Sarah Jenkins)
    const app1Date = new Date();
    app1Date.setDate(app1Date.getDate() + 2); // 2 days in future
    await Appointment.create({
      doctorId: doctor1._id,
      patientId: patient1._id,
      appointmentDate: app1Date,
      appointmentTime: '09:00 AM',
      status: 'Pending',
      reason: 'Routine checkup and blood pressure monitoring.',
    });

    // App 2: Approved (Jane with Dr. Sarah Jenkins)
    const app2Date = new Date();
    app2Date.setDate(app2Date.getDate() + 4); // 4 days in future
    await Appointment.create({
      doctorId: doctor1._id,
      patientId: patient2._id,
      appointmentDate: app2Date,
      appointmentTime: '02:00 PM',
      status: 'Approved',
      reason: 'Heart palpitation symptoms check.',
    });

    // App 3: Completed (John with Dr. Michael Chen)
    const app3Date = new Date();
    app3Date.setDate(app3Date.getDate() - 5); // 5 days in past
    await Appointment.create({
      doctorId: doctor2._id,
      patientId: patient1._id,
      appointmentDate: app3Date,
      appointmentTime: '10:00 AM',
      status: 'Completed',
      reason: 'Skin rash inspection and follow up treatment.',
    });

    // App 4: Cancelled (Bob with Dr. Michael Chen)
    const app4Date = new Date();
    app4Date.setDate(app4Date.getDate() - 1); // 1 day in past
    await Appointment.create({
      doctorId: doctor2._id,
      patientId: patient3._id,
      appointmentDate: app4Date,
      appointmentTime: '01:00 PM',
      status: 'Cancelled',
      reason: 'Rescheduled elsewhere due to work conflict.',
    });
    console.log('Seeded 4 test Appointments.');

    // 5. Seed Reports
    await Report.create({
      patientId: patient1._id,
      doctorId: doctor1._id,
      fileURL: '/uploads/sample_ecg_report.pdf',
      fileName: 'ECG_Analysis_2026.pdf',
      fileType: 'PDF',
    });

    await Report.create({
      patientId: patient2._id,
      doctorId: doctor1._id,
      fileURL: '/uploads/blood_panel_chart.png',
      fileName: 'Blood_Panel_Jane.png',
      fileType: 'PNG',
    });
    console.log('Seeded 2 medical Reports.');

    console.log('Database seeded successfully! 🎉');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Seeding failed:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
