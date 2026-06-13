import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Male',
    age: '',
    role: 'PATIENT',
    // Doctor specific fields
    specialization: 'General Medicine',
    qualification: '',
    experience: '',
    hospital: '',
    consultationFee: '',
    about: '',
  });

  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, role, qualification, experience, hospital, consultationFee } = formData;

    if (!name || !email || !password) {
      toast.error('Name, email, and password are required.');
      return;
    }

    // Password validation: 8 chars, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error('Password must be at least 8 characters, contain one uppercase, one lowercase and one number.');
      return;
    }

    // Validation for Doctor fields
    if (role === 'DOCTOR') {
      if (!qualification || !experience || !hospital || !consultationFee) {
        toast.error('Please fill in all doctor qualification and service fee fields.');
        return;
      }
    }

    setLoading(true);
    const registerData = { ...formData };
    
    // Parse numeric fields
    if (registerData.age) registerData.age = Number(registerData.age);
    if (role === 'DOCTOR') {
      registerData.experience = Number(registerData.experience);
      registerData.consultationFee = Number(registerData.consultationFee);
      // Setup default placeholder available hours/days for doctors
      registerData.availableDays = ['Monday', 'Wednesday', 'Friday'];
      registerData.availableSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'];
    }

    const result = await register(registerData);
    setLoading(false);

    if (result.success) {
      toast.success('Registration successful! Confirmation email sent.');
      if (role === 'DOCTOR') {
        toast.info('Your profile is pending admin approval.');
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="container py-5 mt-5 d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
      <div className="card glass-card p-4 p-md-5 border-0 w-100" style={{ maxWidth: '600px' }}>
        <div className="text-center mb-4">
          <span className="fs-1">🩺</span>
          <h3 className="fw-bold mt-2 text-dark font-heading">Register Account</h3>
          <p className="text-secondary small">Create Patient or Doctor credentials</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* General Fields */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold text-secondary">Full Name</label>
              <input
                type="text"
                className="form-control text-dark"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold text-secondary">Email Address</label>
              <input
                type="email"
                className="form-control text-dark"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold text-secondary">Password</label>
              <input
                type="password"
                className="form-control text-dark"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password123"
                required
              />
              <span className="text-muted small-label d-block mt-1">Min 8 chars, 1 uppercase, 1 digit</span>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold text-secondary">Phone Number</label>
              <input
                type="text"
                className="form-control text-dark"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 0199"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold text-secondary">Gender</label>
              <select className="form-select text-dark" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold text-secondary">Age</label>
              <input
                type="number"
                className="form-control text-dark"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="25"
              />
            </div>
          </div>

          {/* Role Picker */}
          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary d-block">Registering As</label>
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="role"
                id="rolePatient"
                value="PATIENT"
                checked={formData.role === 'PATIENT'}
                onChange={handleChange}
              />
              <label className="btn btn-outline-primary py-2 fw-semibold" htmlFor="rolePatient">
                Patient User
              </label>

              <input
                type="radio"
                className="btn-check"
                name="role"
                id="roleDoctor"
                value="DOCTOR"
                checked={formData.role === 'DOCTOR'}
                onChange={handleChange}
              />
              <label className="btn btn-outline-primary py-2 fw-semibold" htmlFor="roleDoctor">
                Doctor Specialist
              </label>
            </div>
          </div>

          {/* Conditional Doctor Form */}
          {formData.role === 'DOCTOR' && (
            <div className="p-3 bg-light rounded-3 border mb-4">
              <h6 className="fw-bold mb-3 text-primary"><i className="bi bi-file-medical"></i> Doctor Profile Details</h6>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">Specialization</label>
                  <select
                    className="form-select text-dark"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">Qualifications</label>
                  <input
                    type="text"
                    className="form-control text-dark"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="MBBS, MD Cardiology"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">Experience (Years)</label>
                  <input
                    type="number"
                    className="form-control text-dark"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="8"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">Consultation Fee ($)</label>
                  <input
                    type="number"
                    className="form-control text-dark"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    placeholder="120"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Clinic / Hospital Affiliation</label>
                <input
                  type="text"
                  className="form-control text-dark"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  placeholder="Metro Healthcare Hospital"
                />
              </div>

              <div className="mb-0">
                <label className="form-label small fw-semibold text-secondary">About Me</label>
                <textarea
                  className="form-control text-dark"
                  name="about"
                  rows="3"
                  value={formData.about}
                  onChange={handleChange}
                  placeholder="Briefly describe your career background..."
                ></textarea>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-gradient-primary w-100 py-3 fw-bold text-white mb-3"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            Register Now
          </button>
        </form>

        <div className="text-center">
          <p className="small text-secondary mb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-primary fw-semibold text-decoration-none">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
