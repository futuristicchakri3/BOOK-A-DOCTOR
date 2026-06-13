import React from 'react';
import { Link } from 'react-router-dom';

const DoctorCard = ({ doctor }) => {
  // Fallback avatar image
  const avatarImage = doctor.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300';

  return (
    <div className="card glass-card h-100 overflow-hidden border-0">
      <div className="doctor-profile-img-container">
        <img
          src={avatarImage}
          alt={doctor.name}
          className="doctor-profile-img"
        />
        <div className="position-absolute top-0 end-0 m-3">
          <span className="badge bg-primary text-white rounded-pill px-3 py-2 fw-semibold">
            {doctor.specialization}
          </span>
        </div>
      </div>
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-secondary small fw-medium">
            <i className="bi bi-mortarboard-fill me-1 text-primary"></i> {doctor.qualification}
          </span>
          <div className="d-flex align-items-center gap-1 text-warning small">
            <i className="bi bi-star-fill"></i>
            <span className="fw-bold text-dark">{doctor.rating ? doctor.rating.toFixed(1) : '5.0'}</span>
          </div>
        </div>
        
        <h5 className="card-title mb-1 text-dark fw-bold">{doctor.name}</h5>
        <p className="text-secondary small mb-3">
          <i className="bi bi-hospital me-1"></i> {doctor.hospital}
        </p>

        <div className="border-top pt-3 mt-auto">
          <div className="row g-2 text-center mb-3">
            <div className="col-6">
              <div className="bg-light rounded p-2">
                <span className="d-block text-secondary small-label">Experience</span>
                <strong className="text-dark">{doctor.experience} Yrs</strong>
              </div>
            </div>
            <div className="col-6">
              <div className="bg-light rounded p-2">
                <span className="d-block text-secondary small-label">Consultation</span>
                <strong className="text-dark">${doctor.consultationFee}</strong>
              </div>
            </div>
          </div>
          
          <Link to={`/doctors/${doctor._id}`} className="btn btn-gradient-primary w-100 py-2">
            View Profile & Book
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
