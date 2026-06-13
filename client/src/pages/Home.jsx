import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/doctors');
    }
  };

  const specializations = [
    { name: 'Cardiology', icon: 'bi-heart-pulse-fill', color: 'text-danger', description: 'Heart and circulatory health specialists.' },
    { name: 'Dermatology', icon: 'bi-droplet-half', color: 'text-primary', description: 'Skin, hair, and nail clinical specialists.' },
    { name: 'Pediatrics', icon: 'bi-baby', color: 'text-success', description: 'Comprehensive childcare and child development.' },
    { name: 'Orthopedics', icon: 'bi-activity', color: 'text-warning', description: 'Bone, joint, and skeletal reconstructive care.' },
  ];

  return (
    <div className="container py-5 mt-5">
      {/* Hero Section */}
      <div className="hero-wrapper text-center px-4 py-5 mb-5 rounded-4 shadow-sm">
        <div className="max-width-800 mx-auto">
          <span className="badge bg-indigo-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 fw-semibold mb-3">
            ✨ Leading Medical Appointment Platform
          </span>
          <h1 className="display-4 fw-extrabold mb-3 text-dark font-heading">
            Find and Book Your <span className="bg-gradient-primary -webkit-background-clip-text -webkit-text-fill-color text-primary">Specialist Doctor</span> Instantly
          </h1>
          <p className="lead text-secondary mb-4">
            Connect with certified practitioners, schedule face-to-face or virtual consultation slots, and manage your medical records seamlessly in one secure portal.
          </p>

          {/* Search box */}
          <form onSubmit={handleSearch} className="max-width-600 mx-auto mb-4">
            <div className="input-group bg-white p-2 rounded-4 shadow border">
              <span className="input-group-text bg-transparent border-0 fs-5 text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 bg-transparent py-3 text-dark"
                placeholder="Search doctors by name, specialization, or clinic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-gradient-primary rounded-3 px-4 fw-semibold text-white">
                Search
              </button>
            </div>
          </form>

          <div className="d-flex flex-wrap justify-content-center gap-4 text-secondary small">
            <div><i className="bi bi-shield-check text-primary"></i> 100% Verified Clinicians</div>
            <div><i className="bi bi-calendar-event text-primary"></i> Real-time Slot Booking</div>
            <div><i className="bi bi-file-earmark-medical text-primary"></i> Digital Report Uploads</div>
          </div>
        </div>
      </div>

      {/* Specialization Categories */}
      <section className="mb-5 py-3">
        <h2 className="section-title-center">Top Medical Specialties</h2>
        <p className="text-center text-secondary mb-5 max-width-600 mx-auto">
          Access high-caliber treatment from practitioners across various medical divisions.
        </p>
        <div className="row g-4">
          {specializations.map((spec) => (
            <div key={spec.name} className="col-md-6 col-lg-3">
              <div 
                className="card glass-card h-100 p-4 border-0 text-center cursor-pointer"
                onClick={() => navigate(`/doctors?specialization=${spec.name}`)}
              >
                <div className={`fs-1 ${spec.color} mb-3 animate-pulse-soft`}>
                  <i className={`bi ${spec.icon}`}></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">{spec.name}</h5>
                <p className="text-secondary small mb-3">{spec.description}</p>
                <span className="text-primary small fw-semibold d-inline-flex align-items-center gap-1 mx-auto mt-auto">
                  Browse doctors <i className="bi bi-arrow-right"></i>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mb-5 py-5 bg-white rounded-4 border p-4 p-md-5">
        <div className="row g-5 align-items-center">
          <div className="col-lg-6">
            <h2 className="section-title mb-4">Why Book with Us?</h2>
            <p className="text-secondary mb-4">
              We leverage modern web technologies to bypass outdated phone scheduling systems, providing patient-centered scheduling interfaces directly available on mobile or desktop.
            </p>
            
            <div className="d-flex flex-column gap-3">
              <div className="d-flex gap-3">
                <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                  <i className="bi bi-person-badge-fill fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Select and Compare Doctors</h6>
                  <p className="text-secondary small">Filter listings by experience, consultations fee and peer ratings.</p>
                </div>
              </div>

              <div className="d-flex gap-3">
                <div className="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                  <i className="bi bi-shield-lock-fill fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Encrypted Record Sharing</h6>
                  <p className="text-secondary small">Upload clinical reports privately to your consultant in a secure manner.</p>
                </div>
              </div>

              <div className="d-flex gap-3">
                <div className="bg-warning-subtle text-warning rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                  <i className="bi bi-envelope-check-fill fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Email Alerts and Confirmations</h6>
                  <p className="text-secondary small">Receive real-time notifications on doctor validation and approved status.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 text-center">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600"
              alt="Medical Consultation"
              className="img-fluid rounded-4 shadow-sm animate-float"
              style={{ maxHeight: '380px', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mb-5 py-3 text-center">
        <h2 className="section-title-center">What Patients Say</h2>
        <p className="text-secondary mb-5 max-width-600 mx-auto">
          Over 5,000 satisfied users book their appointments through our platform.
        </p>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card glass-card p-4 border-0 text-start h-100">
              <div className="d-flex gap-1 text-warning mb-3">
                <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
              </div>
              <p className="text-secondary small mb-4 italic">
                "The experience was incredibly fast. I scheduled my cardiologist appointment within minutes and uploaded my recent blood reports directly in the portal before stepping in."
              </p>
              <div className="d-flex align-items-center gap-2 mt-auto">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=80" alt="Sarah K." className="rounded-circle" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                <div>
                  <h6 className="fw-bold mb-0 text-dark small">Sarah K.</h6>
                  <span className="text-muted small-label">Patient</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card glass-card p-4 border-0 text-start h-100">
              <div className="d-flex gap-1 text-warning mb-3">
                <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
              </div>
              <p className="text-secondary small mb-4 italic">
                "Being able to see doctor available days and hours directly cut down the endless email chains. Simple, modern and highly polished healthcare portal."
              </p>
              <div className="d-flex align-items-center gap-2 mt-auto">
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=80" alt="Marcus T." className="rounded-circle" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                <div>
                  <h6 className="fw-bold mb-0 text-dark small">Marcus T.</h6>
                  <span className="text-muted small-label">Patient</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card glass-card p-4 border-0 text-start h-100">
              <div className="d-flex gap-1 text-warning mb-3">
                <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-half"></i>
              </div>
              <p className="text-secondary small mb-4 italic">
                "The doctor dashboard is extremely useful. It organizes my daily timings, lets me review patient records, and details my monthly earnings with a single tap."
              </p>
              <div className="d-flex align-items-center gap-2 mt-auto">
                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=80" alt="Dr. Sarah J." className="rounded-circle" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                <div>
                  <h6 className="fw-bold mb-0 text-dark small">Dr. Sarah J.</h6>
                  <span className="text-muted small-label">Cardiologist</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
