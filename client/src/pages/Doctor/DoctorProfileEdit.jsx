import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../../services/authService';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';

const DoctorProfileEdit = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Profile fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [hospital, setHospital] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [about, setAbout] = useState('');

  // Availability matrices
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const commonSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM',
    '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'
  ];

  useEffect(() => {
    const fetchDocProfile = async () => {
      try {
        const res = await getProfile();
        if (res.success && res.data.doctorDetails) {
          const u = res.data.user;
          const d = res.data.doctorDetails;

          setName(u.name || '');
          setPhone(u.phone || '');
          setProfilePic(u.profilePic || '');
          
          setSpecialization(d.specialization || 'General Medicine');
          setQualification(d.qualification || '');
          setExperience(d.experience || '');
          setHospital(d.hospital || '');
          setConsultationFee(d.consultationFee || '');
          setAbout(d.about || '');
          
          setSelectedDays(d.availableDays || []);
          setSelectedSlots(d.availableSlots || []);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDocProfile();
  }, []);

  const handleDayCheck = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSlotCheck = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !qualification || !hospital || !consultationFee) {
      toast.error('Please input your name, qualifications, clinic hospital, and consultation fee.');
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        name,
        phone,
        profilePic,
        specialization,
        qualification,
        experience: Number(experience),
        hospital,
        consultationFee: Number(consultationFee),
        about,
        availableDays: selectedDays,
        availableSlots: selectedSlots,
      };

      const res = await updateProfile(payload);
      if (res.success) {
        toast.success('Doctor profile updated successfully!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit updates.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loader minHeight="70vh" />;
  }

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-9">
          <div className="card glass-card p-4 p-md-5 border-0">
            
            <div className="text-center mb-5">
              <img
                src={profilePic || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'}
                alt="Doctor Profile Preview"
                className="rounded-circle border border-3 border-primary shadow-sm mb-3"
                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
              />
              <h3 className="fw-bold text-dark font-heading">Edit Profile</h3>
              <p className="text-secondary small">Update your clinical qualifications and slot times</p>
            </div>

            <form onSubmit={handleSubmit}>
              <h6 className="fw-bold text-primary mb-3"><i className="bi bi-person-fill"></i> Primary Details</h6>
              
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Profile Image URL</label>
                  <input
                    type="url"
                    className="form-control text-dark text-truncate"
                    value={profilePic}
                    onChange={(e) => setProfilePic(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Specialization</label>
                  <select
                    className="form-select text-dark"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Full Name</label>
                  <input
                    type="text"
                    className="form-control text-dark"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                  <input
                    type="text"
                    className="form-control text-dark"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Qualifications</label>
                  <input
                    type="text"
                    className="form-control text-dark"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="MBBS, MD Cardiology"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Clinic / Hospital</label>
                  <input
                    type="text"
                    className="form-control text-dark"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Consultation Fee ($)</label>
                  <input
                    type="number"
                    className="form-control text-dark"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <label className="form-label small fw-semibold text-secondary">Experience (Years)</label>
                  <input
                    type="number"
                    className="form-control text-dark"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-9">
                  <label className="form-label small fw-semibold text-secondary">About Me</label>
                  <textarea
                    className="form-control text-dark"
                    rows="3"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <h6 className="fw-bold text-primary mb-3"><i className="bi bi-calendar3"></i> Set Consultation Days</h6>
              <div className="p-3 bg-light border rounded-3 mb-4">
                <div className="row g-2">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="col-6 col-sm-4 col-md-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`day-${day}`}
                          checked={selectedDays.includes(day)}
                          onChange={() => handleDayCheck(day)}
                        />
                        <label className="form-check-label small fw-medium text-dark" htmlFor={`day-${day}`}>
                          {day}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <h6 className="fw-bold text-primary mb-3"><i className="bi bi-clock-fill"></i> Set Consultation Slot Hours</h6>
              <div className="p-3 bg-light border rounded-3 mb-4">
                <div className="row g-3">
                  {commonSlots.map((slot) => (
                    <div key={slot} className="col-6 col-sm-4 col-md-3 col-lg-2">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`slot-${slot.replace(' ', '_')}`}
                          checked={selectedSlots.includes(slot)}
                          onChange={() => handleSlotCheck(slot)}
                        />
                        <label className="form-check-label small-label fw-medium text-dark" htmlFor={`slot-${slot.replace(' ', '_')}`}>
                          {slot}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-gradient-primary w-100 py-3 fw-bold text-white mt-4"
                disabled={updating}
              >
                {updating ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                Save Profile Configuration
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileEdit;
