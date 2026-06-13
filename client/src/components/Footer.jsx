import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-auto">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="text-white mb-3 d-flex align-items-center gap-2">
              <span>🩺</span> Book A Doctor
            </h5>
            <p className="text-secondary small">
              Our mission is to make quality healthcare booking easily accessible, anytime and anywhere. Connecting patients with verified clinics and specialists globally.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-secondary hover-text-white fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-secondary hover-text-white fs-5"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="text-secondary hover-text-white fs-5"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-secondary hover-text-white fs-5"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-6">
            <h6 className="text-white mb-3">Quick Links</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/" className="text-secondary text-decoration-none hover-text-white">Home</Link></li>
              <li><Link to="/doctors" className="text-secondary text-decoration-none hover-text-white">Find Doctors</Link></li>
              <li><Link to="/login" className="text-secondary text-decoration-none hover-text-white">Sign In</Link></li>
              <li><Link to="/register" className="text-secondary text-decoration-none hover-text-white">Register Account</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="text-white mb-3">Services</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><a href="#" className="text-secondary text-decoration-none">Cardiology</a></li>
              <li><a href="#" className="text-secondary text-decoration-none">Dermatology</a></li>
              <li><a href="#" className="text-secondary text-decoration-none">Pediatrics</a></li>
              <li><a href="#" className="text-secondary text-decoration-none">General Care</a></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="text-white mb-3">Newsletter</h6>
            <p className="text-secondary small">Subscribe to get medical updates and wellness articles.</p>
            <div className="input-group">
              <input type="email" className="form-control bg-secondary border-0 text-white" placeholder="Enter your email" aria-label="Enter your email" />
              <button className="btn btn-primary" type="button">Subscribe</button>
            </div>
          </div>
        </div>

        <hr className="border-secondary my-4" />
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <p className="text-secondary small mb-0">
            © {new Date().getFullYear()} Book A Doctor. All rights reserved.
          </p>
          <div className="d-flex gap-3 small">
            <a href="#" className="text-secondary text-decoration-none">Privacy Policy</a>
            <a href="#" className="text-secondary text-decoration-none">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
