import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getProfile } from '../../services/authService';
import { getAppointmentsByDoctor, updateAppointmentStatus } from '../../services/appointmentService';
import AppointmentCard from '../../components/AppointmentCard';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';

const DoctorAppointments = () => {
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Patient reports modal states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientReports, setPatientReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const fetchDoctorAppointments = useCallback(async () => {
    try {
      const authRes = await getProfile();
      if (authRes.success && authRes.data.doctorDetails) {
        const docInfo = authRes.data.doctorDetails;
        setDoctorProfile(docInfo);

        const appRes = await getAppointmentsByDoctor(docInfo._id);
        if (appRes.success) {
          setAppointments(appRes.data);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctorAppointments();
  }, [fetchDoctorAppointments]);

  const handleStatusChange = async (appointmentId, newStatus, reason) => {
    try {
      const res = await updateAppointmentStatus(appointmentId, { status: newStatus, reason });
      if (res.success) {
        toast.success(`Appointment status updated to ${newStatus}!`);
        fetchDoctorAppointments();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status.');
    }
  };

  const handleViewReports = async (patient) => {
    setSelectedPatient(patient);
    setReportsLoading(true);
    try {
      const res = await axios.get(`/api/reports/${patient._id}`);
      if (res.data.success) {
        setPatientReports(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch patient reports.');
    } finally {
      setReportsLoading(false);
    }
  };

  if (loading) {
    return <Loader minHeight="60vh" />;
  }

  return (
    <div className="container py-5 mt-5">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Appointment Logs</h2>
          <p className="text-secondary small mb-0">Total of {appointments.length} booking records registered.</p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {appointments.length === 0 ? (
            <div className="card glass-card p-5 text-center border-0">
              <i className="bi bi-calendar-check display-3 text-secondary mb-3"></i>
              <h4 className="fw-bold text-dark mb-2">No Appointments Logged</h4>
              <p className="text-secondary mb-0">Patients have not requested slots with you yet.</p>
            </div>
          ) : (
            <div>
              {appointments.map((app) => (
                <div key={app._id} className="position-relative">
                  <AppointmentCard
                    appointment={app}
                    role="DOCTOR"
                    onStatusChange={handleStatusChange}
                  />
                  <div className="position-absolute" style={{ top: '24px', right: '24px' }}>
                    <button
                      className="btn btn-sm btn-outline-primary py-1 px-3 d-flex align-items-center gap-1"
                      onClick={() => handleViewReports(app.patientId)}
                    >
                      <i className="bi bi-folder2-open"></i> Patient Reports
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <div className="card glass-card p-4 border-0 position-sticky" style={{ top: '100px', minHeight: '400px' }}>
            <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">
              <i className="bi bi-file-earmark-medical text-primary me-2"></i> Clinical Files Viewer
            </h5>

            {!selectedPatient ? (
              <div className="text-center py-5 text-secondary small">
                <i className="bi bi-person-bounding-box display-4 mb-2 d-block text-muted"></i>
                Select "Patient Reports" on any booking to review laboratory files.
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <span className="text-secondary small-label d-block">Selected Patient</span>
                  <strong className="text-dark fs-5">{selectedPatient.name}</strong>
                  <span className="text-muted d-block small mt-1">
                    Phone: {selectedPatient.phone || 'N/A'}
                  </span>
                </div>

                <h6 className="fw-bold text-secondary mb-3">Uploaded Documents:</h6>

                {reportsLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                  </div>
                ) : patientReports.length === 0 ? (
                  <div className="alert alert-secondary small text-center mb-0">
                    No files uploaded by this patient.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {patientReports.map((report) => (
                      <div key={report._id} className="p-3 bg-light border rounded-3 d-flex justify-content-between align-items-center">
                        <div className="text-truncate me-2">
                          <strong className="text-dark small d-block text-truncate" title={report.fileName}>
                            {report.fileName}
                          </strong>
                          <span className="text-muted small-label">
                            {report.fileType} • {new Date(report.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <a
                          href={report.fileURL}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-primary text-white"
                          title="View document"
                        >
                          <i className="bi bi-download"></i>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;
