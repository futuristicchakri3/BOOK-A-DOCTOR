import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/authService';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const PatientProfile = () => {
  const { syncLocalProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'Male',
    age: '',
    profilePic: '',
    password: '',
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await getProfile();
        if (res.success) {
          const u = res.data.user;
          setFormData({
            name: u.name || '',
            phone: u.phone || '',
            gender: u.gender || 'Male',
            age: u.age || '',
            profilePic: u.profilePic || '',
            password: '',
          });
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to retrieve profile particulars.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Name field cannot be empty.');
      return;
    }

    if (formData.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        toast.error('Password must be at least 8 characters, contain one uppercase, one lowercase and one number.');
        return;
      }
    }

    setUpdating(true);
    try {
      const updatePayload = { ...formData };
      if (!updatePayload.password) {
        delete updatePayload.password;
      }
      if (updatePayload.age) {
        updatePayload.age = Number(updatePayload.age);
      }

      const res = await updateProfile(updatePayload);
      if (res.success) {
        toast.success('Profile updated successfully!');
        syncLocalProfile(res.data);
        setFormData((prev) => ({ ...prev, password: '' }));
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update profile particulars.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loader minHeight="60vh" />;
  }

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card glass-card p-4 p-md-5 border-0">
            <div className="text-center mb-4">
              <img
                src={formData.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                alt="Profile Preview"
                className="rounded-circle border border-3 border-primary shadow-sm mb-3"
                style={{ width: '110px', height: '110px', objectFit: 'cover' }}
              />
              <h3 className="fw-bold text-dark font-heading">My Profile</h3>
              <p className="text-secondary small">Update your patient information</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Profile Image URL */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Profile Image URL</label>
                <input
                  type="url"
                  className="form-control text-dark text-truncate"
                  name="profilePic"
                  value={formData.profilePic}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              {/* Name and Phone */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">Full Name</label>
                  <input
                    type="text"
                    className="form-control text-dark"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                  <input
                    type="text"
                    className="form-control text-dark"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 555 0102"
                  />
                </div>
              </div>

              {/* Age and Gender */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">Age</label>
                  <input
                    type="number"
                    className="form-control text-dark"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="30"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">Gender</label>
                  <select
                    className="form-select text-dark"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Change Password */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">New Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  className="form-control text-dark"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <span className="text-muted small-label d-block mt-1">Min 8 chars, 1 uppercase, 1 digit if setting new</span>
              </div>

              <button
                type="submit"
                className="btn btn-gradient-primary w-100 py-3 fw-bold text-white"
                disabled={updating}
              >
                {updating ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                Save Profile Updates
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
