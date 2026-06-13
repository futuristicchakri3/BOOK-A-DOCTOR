import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDoctors } from '../services/doctorService';
import DoctorCard from '../components/DoctorCard';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || '');
  const [maxFee, setMaxFee] = useState(searchParams.get('maxFee') || '250');
  const [minExperience, setMinExperience] = useState(searchParams.get('minExperience') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Sync state to URL params when parameters change
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSpecialization(searchParams.get('specialization') || '');
    setPage(parseInt(searchParams.get('page')) || 1);
  }, [searchParams]);

  const fetchFilteredDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 6,
        isApproved: true
      };
      if (search) params.search = search;
      if (specialization) params.specialization = specialization;
      if (maxFee) params.maxFee = Number(maxFee);
      if (minExperience) params.minExperience = Number(minExperience);
      if (minRating) params.minRating = Number(minRating);

      const res = await getDoctors(params);
      if (res.success) {
        setDoctors(res.data);
        setPagination(res.pagination);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve doctor listings.');
    } finally {
      setLoading(false);
    }
  }, [search, specialization, maxFee, minExperience, minRating, page]);

  useEffect(() => {
    fetchFilteredDoctors();
  }, [fetchFilteredDoctors]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (specialization) newParams.specialization = specialization;
    if (maxFee) newParams.maxFee = maxFee;
    if (minExperience) newParams.minExperience = minExperience;
    if (minRating) newParams.minRating = minRating;
    
    newParams.page = '1';
    setPage(1);
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSpecialization('');
    setMaxFee('250');
    setMinExperience('');
    setMinRating('');
    setPage(1);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPage(newPage);
      const currentParams = Object.fromEntries([...searchParams]);
      setSearchParams({ ...currentParams, page: newPage.toString() });
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row g-4">
        {/* Left Side: Filter Form Panel */}
        <div className="col-lg-3">
          <div className="card glass-card p-4 border-0 position-sticky" style={{ top: '100px' }}>
            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center justify-content-between">
              <span><i className="bi bi-funnel-fill text-primary"></i> Filters</span>
              <button 
                type="button" 
                className="btn btn-link btn-sm text-decoration-none text-muted p-0"
                onClick={handleClearFilters}
              >
                Clear All
              </button>
            </h5>

            <form onSubmit={handleApplyFilters}>
              {/* Search text */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Search Keyword</label>
                <input
                  type="text"
                  className="form-control text-dark"
                  placeholder="Doctor, clinic, etc."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Specialization Select */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Specialty</label>
                <select 
                  className="form-select text-dark"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                >
                  <option value="">All Specialties</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>

              {/* Consultation Fee Range */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary d-flex justify-content-between">
                  <span>Max Consultation Fee</span>
                  <span className="text-primary fw-bold">${maxFee}</span>
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="30"
                  max="300"
                  step="10"
                  value={maxFee}
                  onChange={(e) => setMaxFee(e.target.value)}
                />
              </div>

              {/* Min Experience */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Min Experience</label>
                <select 
                  className="form-select text-dark"
                  value={minExperience}
                  onChange={(e) => setMinExperience(e.target.value)}
                >
                  <option value="">Any Experience</option>
                  <option value="1">1+ Year</option>
                  <option value="5">5+ Years</option>
                  <option value="10">10+ Years</option>
                  <option value="15">15+ Years</option>
                </select>
              </div>

              {/* Rating filter */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Min Rating</label>
                <select 
                  className="form-select text-dark"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                >
                  <option value="">Any Rating</option>
                  <option value="4">4.0+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.8">4.8+ Stars</option>
                </select>
              </div>

              <button type="submit" className="btn btn-gradient-primary w-100 py-2 fw-semibold">
                Apply Filters
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Doctor Card Grid */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-dark mb-0">Available Clinicians</h2>
            <span className="text-secondary small fw-medium">{pagination.total} practitioners found</span>
          </div>

          {loading ? (
            <Loader minHeight="50vh" />
          ) : doctors.length === 0 ? (
            <div className="card glass-card p-5 text-center border-0">
              <i className="bi bi-search display-3 text-secondary mb-3"></i>
              <h4 className="fw-bold text-dark mb-2">No Doctors Found</h4>
              <p className="text-secondary mb-4">Try relaxing your search terms or altering filters.</p>
              <button className="btn btn-gradient-primary mx-auto" onClick={handleClearFilters}>
                Show All Doctors
              </button>
            </div>
          ) : (
            <>
              <div className="row g-4 mb-4">
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="col-md-6 col-lg-4">
                    <DoctorCard doctor={doctor} />
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {pagination.pages > 1 && (
                <nav className="d-flex justify-content-center mt-5">
                  <ul className="pagination gap-2 border-0">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="btn btn-outline-primary px-3 py-2" 
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >
                        <i className="bi bi-chevron-left"></i> Previous
                      </button>
                    </li>
                    {[...Array(pagination.pages)].map((_, i) => (
                      <li key={i} className={`page-item`}>
                        <button
                          className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-outline-primary'} px-3 py-2`}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${page === pagination.pages ? 'disabled' : ''}`}>
                      <button 
                        className="btn btn-outline-primary px-3 py-2" 
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === pagination.pages}
                      >
                        Next <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
