import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getDoctors } from '../services/doctorService';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const UploadReports = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [reportName, setReportName] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  const fetchReportsAndDocs = useCallback(async () => {
    if (!user) return;
    try {
      const docsRes = await getDoctors({ isApproved: true });
      if (docsRes.success) {
        setDoctors(docsRes.data);
      }

      const reportsRes = await axios.get(`/api/reports/${user._id}`);
      if (reportsRes.data.success) {
        setReports(reportsRes.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load doctors or medical reports.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReportsAndDocs();
  }, [fetchReportsAndDocs]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    setFile(selectedFile);
    setReportName(selectedFile.name.split('.')[0]);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoctor || !file || !reportName) {
      toast.error('Please select a doctor, choose a file, and input a report name.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('doctorId', selectedDoctor);
    formData.append('fileName', reportName);

    setUploading(true);
    try {
      const res = await axios.post('/api/reports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        toast.success('Medical report uploaded successfully!');
        setFile(null);
        setFilePreview('');
        setSelectedDoctor('');
        setReportName('');
        document.getElementById('reportFileInput').value = '';
        fetchReportsAndDocs();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Upload failed. Only image and PDF formats supported.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to permanently delete this report?')) return;

    try {
      const res = await axios.delete(`/api/reports/${reportId}`);
      if (res.data.success) {
        toast.success('Report deleted successfully.');
        fetchReportsAndDocs();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete report.');
    }
  };

  if (loading) {
    return <Loader minHeight="60vh" />;
  }

  return (
    <div className="container py-5 mt-5">
      <div className="row g-4">
        {/* Left Side: Upload Form Panel */}
        <div className="col-lg-5">
          <div className="card glass-card p-4 border-0">
            <h4 className="fw-bold text-dark mb-3 font-heading"><i className="bi bi-cloud-arrow-up text-primary me-2"></i> Upload Report</h4>
            <p className="text-secondary small mb-4">Attach lab analysis files, x-rays, or prescriptions in PDF or image format to share with your clinician.</p>

            <form onSubmit={handleSubmit}>
              {/* Doctor Dropdown */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Share with Doctor</label>
                <select
                  className="form-select text-dark"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  required
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>

              {/* Report Title */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Document Title</label>
                <input
                  type="text"
                  className="form-control text-dark"
                  placeholder="e.g. Blood Test Result"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  required
                />
              </div>

              {/* File Attachment */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Select Attachment (PDF, JPG, PNG)</label>
                <input
                  type="file"
                  id="reportFileInput"
                  className="form-control"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  required
                />
                <span className="text-muted small-label d-block mt-1">Maximum size allowed: 10MB</span>
              </div>

              {/* File Previews */}
              {file && (
                <div className="card bg-light p-3 border mb-4 rounded-3 text-center">
                  <span className="d-block text-secondary small fw-bold mb-2">Selected File Preview</span>
                  
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="attachment preview"
                      className="img-fluid rounded border shadow-sm mx-auto d-block"
                      style={{ maxHeight: '180px', objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="py-4">
                      <i className="bi bi-file-earmark-pdf-fill display-3 text-danger mb-2"></i>
                      <p className="small mb-0 text-dark fw-semibold">{file.name}</p>
                      <span className="text-secondary small">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-gradient-primary w-100 py-3 fw-bold text-white"
                disabled={uploading || !file}
              >
                {uploading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                Upload Document
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Uploaded Records History List */}
        <div className="col-lg-7">
          <div className="card glass-card p-4 border-0 h-100">
            <h4 className="fw-bold text-dark mb-3 font-heading"><i className="bi bi-file-earmark-medical-fill text-primary me-2"></i> Document History</h4>
            <p className="text-secondary small mb-4">View and inspect clinical documents uploaded by you to linked doctors.</p>

            {reports.length === 0 ? (
              <div className="alert alert-info py-4 text-center mb-0 border-0 rounded-3">
                <i className="bi bi-info-circle fs-3 mb-2 d-block"></i>
                No health reports uploaded yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle border-top">
                  <thead>
                    <tr className="small text-secondary">
                      <th>Report Name</th>
                      <th>Linked Doctor</th>
                      <th>Format</th>
                      <th>Uploaded Date</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report._id} className="small">
                        <td className="fw-bold text-dark">{report.fileName}</td>
                        <td>Dr. {report.doctorId?.name || 'N/A'}</td>
                        <td>
                          <span className={`badge ${report.fileType === 'PDF' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} rounded px-2 py-1`}>
                            {report.fileType}
                          </span>
                        </td>
                        <td className="text-secondary">{new Date(report.uploadedAt).toLocaleDateString()}</td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-2">
                            <a
                              href={report.fileURL}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-outline-primary"
                              title="Download/View File"
                            >
                              <i className="bi bi-box-arrow-up-right"></i>
                            </a>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Record"
                              onClick={() => handleDelete(report._id)}
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
      </div>
    </div>
  );
};

export default UploadReports;
