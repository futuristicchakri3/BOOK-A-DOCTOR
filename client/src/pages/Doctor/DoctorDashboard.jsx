import React, { useState, useEffect, useCallback } from 'react';
import { getProfile } from '../../services/authService';
import { getAppointmentsByDoctor, updateAppointmentStatus } from '../../services/appointmentService';
import AppointmentCard from '../../components/AppointmentCard';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const authRes = await getProfile();
      if (authRes.success && authRes.data.doctorDetails) {
        const docInfo = authRes.data.doctorDetails;
        setDoctorProfile(docInfo);

        const appRes = await getAppointmentsByDoctor(docInfo._id);
        if (appRes.success) {
          setAppointments(appRes.data);
        }
      } else {
        toast.error('Doctor profile details not found. Please contact support.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleStatusChange = async (appointmentId, newStatus, reason) => {
    try {
      const res = await updateAppointmentStatus(appointmentId, { status: newStatus, reason });
      if (res.success) {
        toast.success(`Appointment marked as ${newStatus}!`);
        fetchDashboardData();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update appointment.');
    }
  };

  if (loading) {
    return <Loader minHeight="65vh" />;
  }

  const approvedSessions = appointments.filter((a) => a.status === 'Approved' || a.status === 'Completed');
  const totalEarnings = approvedSessions.length * (doctorProfile?.consultationFee || 0);
  const upcomingCount = appointments.filter((a) => a.status === 'Approved').length;
  const pendingRequests = appointments.filter((a) => a.status === 'Pending');

  return (
    <div className="container py-5 mt-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Doctor Dashboard</h2>
          <p className="text-secondary small mb-0">Manage your patient appointments and check clinical earnings.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={() => navigate('/doctor/profile-edit')}>
            <i className="bi bi-gear-fill me-1"></i> Edit Profile & Hours
          </button>
          <button className="btn btn-gradient-primary text-white" onClick={() => navigate('/doctor/appointments')}>
            <i className="bi bi-calendar3 me-1"></i> View All Bookings
          </button>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card glass-card p-4 border-0 text-center text-md-start">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-secondary small fw-bold uppercase">Estimated Revenue</span>
              <span className="fs-3 text-success"><i className="bi bi-currency-dollar"></i></span>
            </div>
            <h3 className="fw-bold text-dark mb-1">${totalEarnings}</h3>
            <p className="text-secondary small-label mb-0">From {approvedSessions.length} approved/completed bookings</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card glass-card p-4 border-0 text-center text-md-start">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-secondary small fw-bold uppercase">Upcoming Sessions</span>
              <span className="fs-3 text-primary"><i className="bi bi-people-fill"></i></span>
            </div>
            <h3 className="fw-bold text-dark mb-1">{upcomingCount}</h3>
            <p className="text-secondary small-label mb-0">Appointments approved & active</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card glass-card p-4 border-0 text-center text-md-start">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-secondary small fw-bold uppercase">Pending Requests</span>
              <span className="fs-3 text-warning"><i className="bi bi-hourglass-split"></i></span>
            </div>
            <h3 className="fw-bold text-dark mb-1">{pendingRequests.length}</h3>
            <p className="text-secondary small-label mb-0">Requires your review & approval</p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card glass-card p-4 border-0 h-100">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-exclamation-circle text-warning me-2"></i> Pending Requests</h5>
            <hr />
            
            {pendingRequests.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <i className="bi bi-check2-all display-4 text-success mb-2 d-block"></i>
                No pending appointment requests.
              </div>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
                {pendingRequests.map((app) => (
                  <AppointmentCard
                    key={app._id}
                    appointment={app}
                    role="DOCTOR"
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card glass-card p-4 border-0 h-100">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-calendar-check text-primary me-2"></i> Upcoming Schedule</h5>
            <hr />

            {appointments.filter((a) => a.status === 'Approved').length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <i className="bi bi-calendar-event display-4 text-secondary mb-2 d-block"></i>
                No approved upcoming bookings scheduled.
              </div>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
                {appointments
                  .filter((a) => a.status === 'Approved')
                  .map((app) => (
                    <AppointmentCard
                      key={app._id}
                      appointment={app}
                      role="DOCTOR"
                      onStatusChange={handleStatusChange}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
