import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.data.name}!`);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="container py-5 mt-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card glass-card p-4 p-md-5 border-0 w-100" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <span className="fs-1">🩺</span>
          <h3 className="fw-bold mt-2 text-dark font-heading">Sign In</h3>
          <p className="text-secondary small">Access the Book a Doctor platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Email Address</label>
            <div className="input-group border rounded-3 bg-white p-1">
              <span className="input-group-text bg-transparent border-0 text-secondary">
                <i className="bi bi-envelope-fill"></i>
              </span>
              <input
                type="email"
                className="form-control border-0 bg-transparent text-dark"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">Password</label>
            <div className="input-group border rounded-3 bg-white p-1">
              <span className="input-group-text bg-transparent border-0 text-secondary">
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                type="password"
                className="form-control border-0 bg-transparent text-dark"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-gradient-primary w-100 py-3 fw-bold text-white mb-3"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            Sign In
          </button>
        </form>

        <div className="text-center">
          <p className="small text-secondary mb-0">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary fw-semibold text-decoration-none">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
