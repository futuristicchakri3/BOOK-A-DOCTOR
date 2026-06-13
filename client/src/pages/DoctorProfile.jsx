import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorById } from '../services/doctorService';
import { bookAppointment } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const DoctorProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking scheduler states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await getDoctorById(id);
        if (res.success) {
          setDoctor(res.data);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load doctor profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.info('Please sign in as a Patient to schedule appointments.');
      navigate('/login');
      return;
    }

    if (user.role !== 'PATIENT') {
      toast.error('Only patient accounts can schedule doctor sessions.');
      return;
    }

    if (!selectedDate || !selectedSlot) {
      toast.error('Please choose a valid date and available time slot.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await bookAppointment({
        doctorId: doctor._id,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        reason,
      });

      if (res.success) {
        toast.success(`Booking request submitted successfully to Dr. ${doctor.name}!`);
        navigate('/my-appointments');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Double booking error. Slot already taken.';
      toast.error(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  // Helper to generate next 14 calendar dates
  const getAvailableDates = () => {
    if (!doctor || !doctor.availableDays) return [];
    
    const dates = [];
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < 14; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      const dayName = dayNames[nextDate.getDay()];

      // Match against doctor available days
      const isAvailable = doctor.availableDays.some(
        (day) => day.toLowerCase() === dayName.toLowerCase()
      );

      if (isAvailable) {
        dates.push({
          dateStr: nextDate.toISOString().split('T')[0],
          formatted: nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
        });
      }
    }
    return dates;
  };

  if (loading) {
    return <Loader minHeight="70vh" />;
  }

  if (!doctor) {
    return (
      <div className="container py-5 mt-5 text-center">
        <h3 className="text-secondary">Doctor Profile Not Found</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/doctors')}>Back to Directory</button>
      </div>
    );
  }

  const matches = getAvailableDates();

  return (
    <div className="container py-5 mt-5">
      <div className="row g-4">
        {/* Left Side: Profile Card */}
        <div className="col-lg-5">
          <div className="card glass-card p-4 border-0 text-center text-lg-start h-100">
            <div className="d-flex flex-column flex-lg-row align-items-center gap-4 mb-4">
              <img
                src={doctor.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'}
                alt={doctor.name}
                className="rounded-4 border border-3 border-primary shadow-sm"
                style={{ width: '160px', height: '160px', objectFit: 'cover' }}
              />
              <div>
                <span className="badge bg-primary text-white rounded-pill px-3 py-2 fw-semibold mb-2 d-inline-block">
                  {doctor.specialization}
                </span>
                <h3 className="fw-bold text-dark mb-1">{doctor.name}</h3>
                <p className="text-secondary small mb-2"><i className="bi bi-mortarboard-fill text-primary me-1"></i> {doctor.qualification}</p>
                
                <div className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2 text-warning">
                  <i className="bi bi-star-fill"></i>
                  <span className="fw-bold text-dark">{doctor.rating ? doctor.rating.toFixed(1) : '5.0'} Rating</span>
                </div>
              </div>
            </div>

            <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">About Doctor</h5>
            <p className="text-secondary small leading-relaxed mb-4">
              {doctor.about || `Dr. ${doctor.name} is an esteemed specialist associated with ${doctor.hospital}, delivering professional care backed by ${doctor.experience} years of clinical practice.`}
            </p>

            <div className="row g-3 text-center mb-4">
              <div className="col-6 col-md-4">
                <div className="bg-light p-3 rounded border">
                  <span className="d-block text-secondary small-label mb-1">Consultation</span>
                  <strong className="text-dark fs-5">${doctor.consultationFee}</strong>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="bg-light p-3 rounded border">
                  <span className="d-block text-secondary small-label mb-1">Experience</span>
                  <strong className="text-dark fs-5">{doctor.experience} Yrs</strong>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="bg-light p-3 rounded border">
                  <span className="d-block text-secondary small-label mb-1">Hospital</span>
                  <strong className="text-dark small text-truncate d-block">{doctor.hospital}</strong>
                </div>
              </div>
            </div>

            <button className="btn btn-outline-secondary w-100" onClick={() => navigate('/doctors')}>
              <i className="bi bi-arrow-left"></i> Back to Doctors Directory
            </button>
          </div>
        </div>

        {/* Right Side: Appointment Scheduling Panel */}
        <div className="col-lg-7">
          <div className="card glass-card p-4 p-md-5 border-0 h-100">
            <h4 className="fw-bold text-dark mb-3 font-heading"><i className="bi bi-calendar-check text-primary me-2"></i> Book Appointment</h4>
            <p className="text-secondary small mb-4">Select an available date and suitable hour slot to schedule your clinical session.</p>

            <form onSubmit={handleBooking}>
              {/* Step 1: Date picker */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary mb-3"><i className="bi bi-1-circle text-primary me-1"></i> Choose Session Date</label>
                {matches.length === 0 ? (
                  <div className="alert alert-warning small">Doctor has no active available days configured currently.</div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {matches.map((item) => (
                      <button
                        type="button"
                        key={item.dateStr}
                        className={`btn btn-sm py-2 px-3 rounded-3 border ${selectedDate === item.dateStr ? 'btn-primary border-primary' : 'btn-outline-secondary bg-white text-secondary'}`}
                        onClick={() => {
                          setSelectedDate(item.dateStr);
                          setSelectedSlot('');
                        }}
                      >
                        {item.formatted}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 2: Slot Selection */}
              {selectedDate && (
                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary mb-3"><i className="bi bi-2-circle text-primary me-1"></i> Choose Available Hour</label>
                  {doctor.availableSlots.length === 0 ? (
                    <div className="alert alert-warning small">No slot times configured.</div>
                  ) : (
                    <div className="row g-2">
                      {doctor.availableSlots.map((slot) => (
                        <div key={slot} className="col-6 col-sm-4 col-md-3">
                          <button
                            type="button"
                            className={`btn btn-sm w-100 py-2 rounded-3 border ${selectedSlot === slot ? 'btn-primary border-primary' : 'btn-outline-secondary bg-white text-secondary'}`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {slot}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Booking Reason */}
              {selectedDate && selectedSlot && (
                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary mb-2"><i className="bi bi-3-circle text-primary me-1"></i> State Reason / Medical Concern (Optional)</label>
                  <textarea
                    className="form-control text-dark text-area-custom"
                    rows="3"
                    placeholder="Briefly state your concern, symptoms or routine request..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  ></textarea>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-gradient-primary w-100 py-3 fw-bold text-white mt-2"
                disabled={bookingLoading || !selectedDate || !selectedSlot}
              >
                {bookingLoading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                Confirm Booking Session
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
