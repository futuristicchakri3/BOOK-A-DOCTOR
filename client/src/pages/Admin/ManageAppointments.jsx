import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGlobalAppointments = async () => {
    try {
      const res = await axios.get('/api/admin/appointments');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve system-wide appointments logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? This sends an email notification to both patient and doctor.')) return;
    
    try {
      const res = await axios.put(`/api/appointments/${id}`, {
        status: 'Cancelled',
        reason: 'Cancelled by Platform Administrator.',
      });
      if (res.data.success) {
        toast.success('Appointment cancelled successfully.');
        fetchGlobalAppointments();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to cancel appointment.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this appointment record from the database? This is irreversible.')) return;
    
    try {
      const res = await axios.delete(`/api/appointments/${id}`);
      if (res.data.success) {
        toast.success('Appointment record permanently deleted.');
        fetchGlobalAppointments();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete appointment record.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-warning-subtle text-warning border border-warning';
      case 'Approved': return 'bg-success-subtle text-success border border-success';
      case 'Rejected': return 'bg-danger-subtle text-danger border border-danger';
      case 'Completed': return 'bg-primary-subtle text-primary border border-primary';
      case 'Cancelled': return 'bg-secondary-subtle text-secondary border border-secondary';
      default: return 'bg-light';
    }
  };

  if (loading) {
    return <Loader minHeight="60vh" />;
  }

  return (
    <div className="container py-5 mt-5">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Monitor Appointments</h2>
        <p className="text-secondary small">Supervise patient booking schedules and edit session records.</p>
      </div>

      <div className="card glass-card p-4 border-0">
        <h5 className="fw-bold text-dark mb-3">
          <i className="bi bi-calendar3 text-primary me-2"></i> Booking Schedules Logs ({appointments.length})
        </h5>

        {appointments.length === 0 ? (
          <div className="alert alert-secondary small text-center mb-0">No appointment bookings registered on the platform.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="small text-secondary">
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time Slot</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => (
                  <tr key={app._id} className="small">
                    <td>
                      <strong className="text-dark d-block">{app.patientId?.name || 'N/A'}</strong>
                      <span className="text-muted small-label">{app.patientId?.email || 'N/A'}</span>
                    </td>
                    <td>
                      <strong className="text-dark d-block">Dr. {app.doctorId?.name || 'N/A'}</strong>
                      <span className="badge bg-primary-subtle text-primary small-label">{app.doctorId?.specialization || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="d-block fw-bold text-dark">{new Date(app.appointmentDate).toLocaleDateString()}</span>
                      <span className="text-secondary small-label">{app.appointmentTime}</span>
                    </td>
                    <td className="text-muted text-truncate" style={{ maxWidth: '160px' }} title={app.reason}>
                      {app.reason || 'N/A'}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(app.status)} px-2 py-1`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        {(app.status === 'Pending' || app.status === 'Approved') && (
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleCancel(app._id)}
                            title="Cancel Appointment"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(app._id)}
                          title="Delete Permanently"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAppointments;
