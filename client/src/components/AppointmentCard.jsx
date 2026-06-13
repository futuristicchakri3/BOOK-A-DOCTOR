import React, { useState } from 'react';

const AppointmentCard = ({ appointment, role, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { doctorId, patientId, appointmentDate, appointmentTime, status, reason, _id } = appointment;
  const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'Approved': return 'badge-approved';
      case 'Rejected': return 'badge-rejected';
      case 'Completed': return 'badge-completed';
      case 'Cancelled': return 'badge-cancelled';
      default: return 'bg-secondary';
    }
  };

  const handleAction = async (newStatus, customReason = '') => {
    setLoading(true);
    await onStatusChange(_id, newStatus, customReason);
    setLoading(false);
    setShowRejectForm(false);
  };

  // Determine who to display (for patient, display doctor; for doctor/admin, display patient)
  const isPatientView = role === 'PATIENT';
  const displayName = isPatientView ? `Dr. ${doctorId?.name || 'Doctor'}` : (patientId?.name || 'Patient');
  const displaySub = isPatientView ? (doctorId?.specialization || 'Specialist') : `Age: ${patientId?.age || 'N/A'} | Gender: ${patientId?.gender || 'N/A'}`;
  const displayImage = isPatientView 
    ? (doctorId?.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100')
    : (patientId?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100');

  return (
    <div className="card glass-card p-4 mb-3 border-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        {/* Entity details */}
        <div className="d-flex align-items-center gap-3">
          <img
            src={displayImage}
            alt={displayName}
            className="rounded-circle border border-2 border-primary"
            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
          />
          <div>
            <h5 className="mb-1 fw-bold text-dark">{displayName}</h5>
            <p className="text-secondary small mb-0 fw-medium">{displaySub}</p>
            {isPatientView && doctorId?.hospital && (
              <span className="text-muted small"><i className="bi bi-hospital me-1"></i> {doctorId.hospital}</span>
            )}
          </div>
        </div>

        {/* Date and Time Details */}
        <div className="bg-light p-3 rounded-3 text-center border">
          <div className="fw-bold text-primary small"><i className="bi bi-calendar3 me-1"></i> {formattedDate}</div>
          <div className="fw-semibold text-secondary small mt-1"><i className="bi bi-clock me-1"></i> {appointmentTime}</div>
        </div>

        {/* Status */}
        <div>
          <span className={`badge-custom ${getStatusBadgeClass(status)}`}>
            <i className={`bi ${status === 'Approved' ? 'bi-check-circle-fill' : status === 'Pending' ? 'bi-hourglass-split' : 'bi-info-circle-fill'}`}></i>
            {status}
          </span>
        </div>
      </div>

      {/* Booking Reason or Decline Reason */}
      <div className="mt-3 pt-3 border-top bg-light-subtle rounded p-2">
        <p className="small mb-1"><strong className="text-secondary">Booking Reason:</strong> {reason || 'Routine consultation'}</p>
        {appointment.reason && (status === 'Rejected' || status === 'Cancelled') && (
          <p className="small mb-0 text-danger"><strong className="text-secondary">Note/Feedback:</strong> {appointment.reason}</p>
        )}
      </div>

      {/* Action Buttons based on context */}
      <div className="d-flex flex-wrap gap-2 justify-content-end mt-3 pt-2">
        {loading && (
          <button className="btn btn-outline-secondary btn-sm" disabled>
            Updating...
          </button>
        )}

        {!loading && (
          <>
            {/* Patient Controls */}
            {role === 'PATIENT' && (status === 'Pending' || status === 'Approved') && (
              <button
                className="btn btn-outline-danger btn-sm px-3"
                onClick={() => handleAction('Cancelled', 'Cancelled by patient.')}
              >
                Cancel Booking
              </button>
            )}

            {/* Doctor Controls */}
            {role === 'DOCTOR' && status === 'Pending' && (
              <>
                <button
                  className="btn btn-success btn-sm px-3"
                  onClick={() => handleAction('Approved')}
                >
                  Approve Request
                </button>
                <button
                  className="btn btn-outline-danger btn-sm px-3"
                  onClick={() => setShowRejectForm(true)}
                >
                  Decline
                </button>
              </>
            )}

            {role === 'DOCTOR' && status === 'Approved' && (
              <>
                <button
                  className="btn btn-primary btn-sm px-3"
                  onClick={() => handleAction('Completed', 'Treatment finished.')}
                >
                  Mark Completed
                </button>
                <button
                  className="btn btn-outline-danger btn-sm px-3"
                  onClick={() => handleAction('Cancelled', 'Cancelled by doctor.')}
                >
                  Cancel Session
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Reject Reason Form Popover */}
      {showRejectForm && (
        <div className="mt-3 p-3 bg-light rounded border border-danger">
          <label className="form-label small fw-semibold text-danger">Decline Reason</label>
          <textarea
            className="form-control form-control-sm mb-2"
            rows="2"
            placeholder="Provide a short reason for rejecting this booking..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          ></textarea>
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowRejectForm(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleAction('Rejected', rejectReason)}
              disabled={!rejectReason.trim()}
            >
              Submit Decline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
