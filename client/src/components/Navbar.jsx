import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const adminDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setAdminDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active text-primary fw-bold' : '';
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top custom-navbar py-3">
      <div className="container">
        <Link className="navbar-brand navbar-brand-custom d-flex align-items-center gap-2" to="/">
          <span className="fs-3">🩺</span>
          <span>Book A Doctor</span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1 text-center text-lg-start">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/doctors')}`} to="/doctors">Find Doctors</Link>
            </li>
            
            {/* Patient Links */}
            {user && user.role === 'PATIENT' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/my-appointments')}`} to="/my-appointments">My Appointments</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/upload-reports')}`} to="/upload-reports">Upload Reports</Link>
                </li>
              </>
            )}

            {/* Doctor Links */}
            {user && user.role === 'DOCTOR' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/doctor/dashboard')}`} to="/doctor/dashboard">Doctor Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/doctor/appointments')}`} to="/doctor/appointments">Manage Bookings</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/doctor/earnings')}`} to="/doctor/earnings">My Earnings</Link>
                </li>
              </>
            )}

            {/* Admin Links */}
            {user && user.role === 'ADMIN' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/dashboard')}`} to="/admin/dashboard">Admin Dashboard</Link>
                </li>
                <li className="nav-item dropdown" ref={adminDropdownRef}>
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setAdminDropdownOpen(!adminDropdownOpen);
                    }}
                    aria-expanded={adminDropdownOpen}
                  >
                    Manage Platform
                  </a>
                  <ul className={`dropdown-menu border-0 shadow ${adminDropdownOpen ? 'show' : ''}`}>
                    <li><Link className="dropdown-item" to="/admin/doctors" onClick={() => setAdminDropdownOpen(false)}>Manage Doctors</Link></li>
                    <li><Link className="dropdown-item" to="/admin/users" onClick={() => setAdminDropdownOpen(false)}>Manage Patients</Link></li>
                    <li><Link className="dropdown-item" to="/admin/appointments" onClick={() => setAdminDropdownOpen(false)}>Monitor Schedules</Link></li>
                  </ul>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex flex-column flex-lg-row align-items-center gap-3">
            {user ? (
              <div className="dropdown" ref={userDropdownRef}>
                <a
                  className="d-flex align-items-center gap-2 text-decoration-none dropdown-toggle cursor-pointer"
                  href="#"
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setUserDropdownOpen(!userDropdownOpen);
                  }}
                  aria-expanded={userDropdownOpen}
                >
                  <img
                    src={user.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                    alt="avatar"
                    className="rounded-circle border border-2 border-primary"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                  />
                  <span className="text-secondary fw-semibold">{user.name}</span>
                </a>
                <ul className={`dropdown-menu dropdown-menu-end border-0 shadow mt-2 ${userDropdownOpen ? 'show' : ''}`}>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center gap-2 py-2"
                      to={user.role === 'DOCTOR' ? '/doctor/profile-edit' : '/patient/profile'}
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <i className="bi bi-person-fill text-primary"></i>
                      <span>My Profile</span>
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-primary px-4">
                  Login
                </Link>
                <Link to="/register" className="btn btn-gradient-primary px-4">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
