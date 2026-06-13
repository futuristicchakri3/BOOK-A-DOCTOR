import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/admin/analytics');
        if (res.data.success) {
          setAnalytics(res.data.data);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load platform analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <Loader minHeight="70vh" />;
  }

  const { totalUsers, totalDoctors, totalAppointments, totalRevenue, specializations, monthlyTrends } = analytics;

  const width = 450;
  const height = 180;

  const maxAppointments = Math.max(...monthlyTrends.map((d) => d.appointments), 5);
  const maxRevenue = Math.max(...monthlyTrends.map((d) => d.revenue), 500);

  return (
    <div className="container py-5 mt-5">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Administrative Dashboard</h2>
        <p className="text-secondary small">System statistics, user registrations, and platform financial aggregates.</p>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-sm-6 col-lg-3">
          <div className="card glass-card p-4 border-0">
            <span className="text-secondary small fw-bold text-uppercase mb-2">Total Patients</span>
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="fw-bold text-dark mb-0">{totalUsers}</h3>
              <span className="fs-2 text-primary"><i className="bi bi-people-fill"></i></span>
            </div>
            <hr className="my-2" />
            <button className="btn btn-link btn-sm text-decoration-none text-primary p-0 text-start" onClick={() => navigate('/admin/users')}>
              Manage Patients <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card glass-card p-4 border-0">
            <span className="text-secondary small fw-bold text-uppercase mb-2">Total Doctors</span>
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="fw-bold text-dark mb-0">{totalDoctors}</h3>
              <span className="fs-2 text-indigo"><i className="bi bi-person-badge-fill"></i></span>
            </div>
            <hr className="my-2" />
            <button className="btn btn-link btn-sm text-decoration-none text-primary p-0 text-start" onClick={() => navigate('/admin/doctors')}>
              Approve & Manage <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card glass-card p-4 border-0">
            <span className="text-secondary small fw-bold text-uppercase mb-2">Appointments</span>
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="fw-bold text-dark mb-0">{totalAppointments}</h3>
              <span className="fs-2 text-warning"><i className="bi bi-calendar3"></i></span>
            </div>
            <hr className="my-2" />
            <button className="btn btn-link btn-sm text-decoration-none text-primary p-0 text-start" onClick={() => navigate('/admin/appointments')}>
              Monitor Schedules <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card glass-card p-4 border-0">
            <span className="text-secondary small fw-bold text-uppercase mb-2">Total Revenue</span>
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="fw-bold text-success mb-0">${totalRevenue}</h3>
              <span className="fs-2 text-success"><i className="bi bi-wallet2"></i></span>
            </div>
            <hr className="my-2" />
            <span className="small text-secondary">Gross sales across platform</span>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-6">
          <div className="card glass-card p-4 border-0 h-100">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-graph-up text-primary me-2"></i> Bookings Volume Trend</h5>
            <div className="p-3 bg-light border rounded-3 text-center">
              <svg viewBox={`0 0 ${width} ${height + 30}`} className="w-100" style={{ maxHeight: '200px' }}>
                <defs>
                  <linearGradient id="appAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {[0, 0.5, 1].map((ratio, i) => (
                  <line
                    key={i}
                    x1="35"
                    y1={height - ratio * height + 10}
                    x2={width - 15}
                    y2={height - ratio * height + 10}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                ))}
                <text x="5" y="15" fill="#94a3b8" fontSize="10" fontWeight="bold">{maxAppointments}</text>
                <text x="5" y={height / 2 + 10} fill="#94a3b8" fontSize="10" fontWeight="bold">{Math.round(maxAppointments / 2)}</text>
                <text x="5" y={height + 10} fill="#94a3b8" fontSize="10" fontWeight="bold">0</text>
                
                {(() => {
                  const left = 45;
                  const right = 20;
                  const stepX = (width - left - right) / 5;
                  const points = monthlyTrends.map((d, index) => {
                    const x = left + index * stepX;
                    const y = height - (d.appointments / maxAppointments) * height + 10;
                    return { x, y };
                  });

                  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const fillPath = `${linePath} L ${points[points.length - 1].x} ${height + 10} L ${points[0].x} ${height + 10} Z`;

                  return (
                    <>
                      <path d={fillPath} fill="url(#appAreaGrad)" />
                      <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="3" />
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#4f46e5" strokeWidth="2.5" />
                          <text x={p.x} y={p.y - 8} fontSize="9" fontWeight="bold" fill="#1e293b" textAnchor="middle">
                            {monthlyTrends[i].appointments}
                          </text>
                          <text x={p.x} y={height + 25} fontSize="10" fontWeight="semibold" fill="#64748b" textAnchor="middle">
                            {monthlyTrends[i].month}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card glass-card p-4 border-0 h-100">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-wallet2 text-success me-2"></i> Monthly Revenue Flow</h5>
            <div className="p-3 bg-light border rounded-3 text-center">
              <svg viewBox={`0 0 ${width} ${height + 30}`} className="w-100" style={{ maxHeight: '200px' }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                {[0, 0.5, 1].map((ratio, i) => (
                  <line
                    key={i}
                    x1="45"
                    y1={height - ratio * height + 10}
                    x2={width - 15}
                    y2={height - ratio * height + 10}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                ))}
                <text x="5" y="15" fill="#94a3b8" fontSize="10" fontWeight="bold">${maxRevenue}</text>
                <text x="5" y={height / 2 + 10} fill="#94a3b8" fontSize="10" fontWeight="bold">${Math.round(maxRevenue / 2)}</text>
                <text x="5" y={height + 10} fill="#94a3b8" fontSize="10" fontWeight="bold">$0</text>
                
                {(() => {
                  const left = 55;
                  const right = 25;
                  const barWidth = 30;
                  const stepX = (width - left - right) / 5;

                  return monthlyTrends.map((d, index) => {
                    const x = left + index * stepX - barWidth / 2;
                    const barHeight = (d.revenue / maxRevenue) * height;
                    const y = height - barHeight + 10;

                    return (
                      <g key={index}>
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={Math.max(barHeight, 3)}
                          rx="4"
                          fill="url(#barGrad)"
                        />
                        <text x={x + barWidth / 2} y={y - 6} fontSize="9" fontWeight="bold" fill="#1e293b" textAnchor="middle">
                          ${d.revenue}
                        </text>
                        <text x={x + barWidth / 2} y={height + 25} fontSize="10" fontWeight="semibold" fill="#64748b" textAnchor="middle">
                          {d.month}
                        </text>
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card glass-card p-4 border-0 h-100">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-pie-chart text-indigo me-2"></i> Doctors by Speciality</h5>
            <hr />

            {specializations.length === 0 ? (
              <div className="alert alert-secondary small text-center mb-0">No specialty records.</div>
            ) : (
              <div className="d-flex flex-column gap-3 mt-2">
                {specializations.map((spec, index) => {
                  const maxCount = Math.max(...specializations.map((s) => s.count), 1);
                  const percentage = (spec.count / maxCount) * 100;
                  return (
                    <div key={index}>
                      <div className="d-flex justify-content-between align-items-center mb-1 small">
                        <strong className="text-dark">{spec._id || 'General'}</strong>
                        <span className="text-secondary fw-semibold">{spec.count} Doctors</span>
                      </div>
                      <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${percentage}%`, borderRadius: '4px' }}
                          aria-valuenow={percentage}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card glass-card p-4 border-0 h-100">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-shield-lock text-primary me-2"></i> Administrative Controls</h5>
            <hr />
            
            <div className="row g-3">
              <div className="col-6">
                <button className="btn btn-outline-primary w-100 py-3 d-flex flex-column align-items-center gap-2 rounded-3" onClick={() => navigate('/admin/doctors')}>
                  <i className="bi bi-person-badge-fill fs-3"></i>
                  <span className="fw-bold small">Doctor Approvals</span>
                </button>
              </div>
              <div className="col-6">
                <button className="btn btn-outline-primary w-100 py-3 d-flex flex-column align-items-center gap-2 rounded-3" onClick={() => navigate('/admin/users')}>
                  <i className="bi bi-people-fill fs-3"></i>
                  <span className="fw-bold small">Manage Patients</span>
                </button>
              </div>
              <div className="col-6">
                <button className="btn btn-outline-primary w-100 py-3 d-flex flex-column align-items-center gap-2 rounded-3" onClick={() => navigate('/admin/appointments')}>
                  <i className="bi bi-calendar3 fs-3"></i>
                  <span className="fw-bold small">Monitor Booking Logs</span>
                </button>
              </div>
              <div className="col-6">
                <div className="bg-light p-3 border rounded-3 h-100 d-flex flex-column justify-content-center text-center">
                  <span className="d-block text-secondary small-label">Security Protocol</span>
                  <strong className="text-success small"><i className="bi bi-shield-fill-check"></i> Standard SSL Mode</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
