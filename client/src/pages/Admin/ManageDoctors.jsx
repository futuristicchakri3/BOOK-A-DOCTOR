import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctorsList = async () => {
    try {
      const res = await axios.get('/api/admin/doctors');
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load doctors list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorsList();
  }, []);

  const handleApprove = async (id, isApproved) => {
    try {
      const res = await axios.put(`/api/admin/approveDoctor/${id}`, { isApproved });
      if (res.data.success) {
        toast.success(isApproved ? 'Doctor approved successfully!' : 'Doctor status updated.');
        fetchDoctorsList();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update approval status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this doctor and their user account? This cannot be undone.')) return;
    try {
      const res = await axios.delete(`/api/admin/doctor/${id}`);
      if (res.data.success) {
        toast.success('Doctor and associated user account deleted successfully.');
        fetchDoctorsList();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete doctor.');
    }
  };

  if (loading) {
    return <Loader minHeight="60vh" />;
  }

  const pendingDoctors = doctors.filter((doc) => !doc.isApproved);
  const approvedDoctors = doctors.filter((doc) => doc.isApproved);

  return (
    <div className="container py-5 mt-5">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Manage Doctors</h2>
        <p className="text-secondary small">Review practitioner registry credentials and approve verification applications.</p>
      </div>

      <div className="card glass-card p-4 border-0 mb-5">
        <h5 className="fw-bold text-dark mb-3">
          <i className="bi bi-clock-history text-warning me-2"></i> Pending Applications ({pendingDoctors.length})
        </h5>
        
        {pendingDoctors.length === 0 ? (
          <div className="alert alert-secondary small text-center mb-0">No pending doctor registration applications.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="small text-secondary">
                  <th>Doctor Image</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialty</th>
                  <th>Clinic / Hospital</th>
                  <th>Fee</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDoctors.map((doc) => (
                  <tr key={doc._id} className="small">
                    <td>
                      <img
                        src={doc.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=60'}
                        alt={doc.name}
                        className="rounded border"
                        style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                      />
                    </td>
                    <td className="fw-bold text-dark">{doc.name}</td>
                    <td>{doc.email}</td>
                    <td><span className="badge bg-primary text-white">{doc.specialization}</span></td>
                    <td>{doc.hospital}</td>
                    <td className="fw-bold text-dark">${doc.consultationFee}</td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          className="btn btn-sm btn-success px-3"
                          onClick={() => handleApprove(doc._id, true)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(doc._id)}
                        >
                          Decline
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

      <div className="card glass-card p-4 border-0">
        <h5 className="fw-bold text-dark mb-3">
          <i className="bi bi-shield-fill-check text-success me-2"></i> Registered Practitioners ({approvedDoctors.length})
        </h5>

        {approvedDoctors.length === 0 ? (
          <div className="alert alert-secondary small text-center mb-0">No approved registered practitioners visible on directory.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="small text-secondary">
                  <th>Doctor Image</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialty</th>
                  <th>Qualifications</th>
                  <th>Fee</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvedDoctors.map((doc) => (
                  <tr key={doc._id} className="small">
                    <td>
                      <img
                        src={doc.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=60'}
                        alt={doc.name}
                        className="rounded border"
                        style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                      />
                    </td>
                    <td className="fw-bold text-dark">{doc.name}</td>
                    <td>{doc.email}</td>
                    <td><span className="badge bg-primary text-white">{doc.specialization}</span></td>
                    <td>{doc.qualification} ({doc.experience} yrs exp)</td>
                    <td className="fw-bold text-dark">${doc.consultationFee}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(doc._id)}
                      >
                        <i className="bi bi-trash3 me-1"></i> Delete
                      </button>
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

export default ManageDoctors;
