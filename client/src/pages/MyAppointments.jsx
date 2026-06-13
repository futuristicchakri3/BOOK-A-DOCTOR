import React, { useState, useEffect, useCallback } from 'react';
import { getAppointmentsByUser, updateAppointmentStatus } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import AppointmentCard from '../components/AppointmentCard';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MyAppointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserAppointments = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getAppointmentsByUser(user._id);
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserAppointments();
  }, [fetchUserAppointments]);

  const handleStatusChange = async (appointmentId, newStatus, reason) => {
    try {
      const res = await updateAppointmentStatus(appointmentId, { status: newStatus, reason });
      if (res.success) {
        toast.success(`Appointment successfully ${newStatus.toLowerCase()}!`);
        fetchUserAppointments();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update appointment.');
    }
  };

  if (loading) {
    return <Loader minHeight="60vh" />;
  }

  return (
    <div className="container py-5 mt-5">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Bookings</h2>
          <p className="text-secondary small mb-0">Track, monitor, and cancel scheduled sessions.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={() => navigate('/doctors')}>
            <i className="bi bi-plus-circle me-1"></i> Book Another Doctor
          </button>
          <button className="btn btn-gradient-primary text-white" onClick={() => navigate('/upload-reports')}>
            <i className="bi bi-file-earmark-arrow-up me-1"></i> Upload Lab Reports
          </button>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="card glass-card p-5 text-center border-0">
          <i className="bi bi-calendar-x display-3 text-secondary mb-3"></i>
          <h4 className="fw-bold text-dark mb-2">No Bookings Yet</h4>
          <p className="text-secondary mb-4">You do not have any pending or completed doctor consultation sessions.</p>
          <button className="btn btn-gradient-primary mx-auto" onClick={() => navigate('/doctors')}>
            Find and Book a Doctor
          </button>
        </div>
      ) : (
        <div className="row">
          <div className="col-12 col-xl-10 mx-auto">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                role="PATIENT"
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
