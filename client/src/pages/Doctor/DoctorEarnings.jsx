import React, { useState, useEffect, useCallback } from 'react';
import { getProfile } from '../../services/authService';
import { getAppointmentsByDoctor } from '../../services/appointmentService';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';

const DoctorEarnings = () => {
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEarningsData = useCallback(async () => {
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
      toast.error('Failed to retrieve earnings data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarningsData();
  }, [fetchEarningsData]);

  if (loading) {
    return <Loader minHeight="60vh" />;
  }

  const completedAppointments = appointments.filter((a) => a.status === 'Completed' || a.status === 'Approved');
  const fee = doctorProfile?.consultationFee || 0;
  const totalEarnings = completedAppointments.length * fee;

  const getMonthlyBreakdown = () => {
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      monthlyData[key] = { revenue: 0, appointments: 0 };
    }

    completedAppointments.forEach((app) => {
      const date = new Date(app.appointmentDate);
      const key = `${months[date.getMonth()]} ${date.getFullYear().toString().substring(2)}`;
      if (monthlyData[key]) {
        monthlyData[key].revenue += fee;
        monthlyData[key].appointments += 1;
      }
    });

    return Object.entries(monthlyData).map(([name, stats]) => ({
      month: name,
      revenue: stats.revenue,
      appointments: stats.appointments,
    }));
  };

  const chartData = getMonthlyBreakdown();
  const chartHeight = 160;
  const chartWidth = 500;
  const maxVal = Math.max(...chartData.map((d) => d.revenue), 100);

  return (
    <div className="container py-5 mt-5">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Financial Earnings</h2>
        <p className="text-secondary small">Review patient transaction receipts and platform revenue.</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card glass-card p-4 border-0 h-100">
            <span className="text-secondary small fw-bold text-uppercase mb-2">Total Earnings (Gross)</span>
            <h2 className="fw-bold text-success mb-1">${totalEarnings}</h2>
            <p className="text-muted small mb-0">Platform bookings share: 100% (No commission deductions)</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card glass-card p-4 border-0 h-100">
            <span className="text-secondary small fw-bold text-uppercase mb-2">Approved / Completed Bookings</span>
            <h2 className="fw-bold text-primary mb-1">{completedAppointments.length}</h2>
            <p className="text-muted small mb-0">Average booking price: ${fee}</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card glass-card p-4 border-0 h-100">
            <span className="text-secondary small fw-bold text-uppercase mb-2">Consultation Price</span>
            <h2 className="fw-bold text-dark mb-1">${fee}</h2>
            <p className="text-muted small mb-0">Configured fee charged per standard slot check</p>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-8">
          <div className="card glass-card p-4 border-0">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-graph-up-arrow text-primary me-2"></i> Monthly Revenue Trends</h5>
            
            <div className="d-flex justify-content-center p-3 bg-light rounded-3 border">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-100" style={{ maxHeight: '240px' }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                
                {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => (
                  <line
                    key={idx}
                    x1="40"
                    y1={chartHeight - r * chartHeight + 10}
                    x2={chartWidth - 20}
                    y2={chartHeight - r * chartHeight + 10}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                ))}

                <text x="5" y="15" fill="#94a3b8" fontSize="10" fontWeight="bold">$ {maxVal}</text>
                <text x="5" y={chartHeight / 2 + 10} fill="#94a3b8" fontSize="10" fontWeight="bold">$ {Math.round(maxVal / 2)}</text>
                <text x="5" y={chartHeight + 10} fill="#94a3b8" fontSize="10" fontWeight="bold">$ 0</text>

                {(() => {
                  const paddingLeft = 60;
                  const paddingRight = 40;
                  const stepX = (chartWidth - paddingLeft - paddingRight) / 5;
                  
                  const points = chartData.map((d, index) => {
                    const x = paddingLeft + index * stepX;
                    const y = chartHeight - (d.revenue / maxVal) * chartHeight + 10;
                    return { x, y };
                  });

                  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight + 10} L ${points[0].x} ${chartHeight + 10} Z`;

                  return (
                    <>
                      <path d={areaPath} fill="url(#chartGrad)" />
                      <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" />
                      
                      {chartData.map((d, index) => (
                        <text
                          key={index}
                          x={points[index].x}
                          y={chartHeight + 30}
                          fill="#64748b"
                          fontSize="10"
                          textAnchor="middle"
                          fontWeight="semibold"
                        >
                          {d.month}
                        </text>
                      ))}

                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
                          <text
                            x={p.x}
                            y={p.y - 8}
                            fill="#1e293b"
                            fontSize="8"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            ${chartData[i].revenue}
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

        <div className="col-lg-4">
          <div className="card glass-card p-4 border-0 h-100">
            <h5 className="fw-bold text-dark mb-3">Revenue Breakdown</h5>
            <hr />
            
            <div className="d-flex flex-column gap-3">
              {chartData.map((d, idx) => (
                <div key={idx} className="d-flex justify-content-between align-items-center">
                  <div className="small">
                    <strong className="text-dark d-block">{d.month}</strong>
                    <span className="text-secondary">{d.appointments} appointments</span>
                  </div>
                  <strong className="text-dark">${d.revenue}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card glass-card p-4 border-0">
        <h5 className="fw-bold text-dark mb-3"><i className="bi bi-receipt text-primary me-2"></i> Patient Invoices</h5>
        
        {completedAppointments.length === 0 ? (
          <div className="alert alert-secondary small text-center mb-0">No consultations transaction receipts logged.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="small text-secondary">
                  <th>Patient Name</th>
                  <th>Appointment Date</th>
                  <th>Time Slot</th>
                  <th>Amount Paid</th>
                  <th>Payment Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedAppointments.map((app) => (
                  <tr key={app._id} className="small">
                    <td className="fw-bold text-dark">{app.patientId?.name || 'N/A'}</td>
                    <td>{new Date(app.appointmentDate).toLocaleDateString()}</td>
                    <td>{app.appointmentTime}</td>
                    <td className="fw-bold text-success">${fee}</td>
                    <td>Direct/Cash at Hospital</td>
                    <td>
                      <span className={`badge ${app.status === 'Completed' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'} rounded px-2 py-1`}>
                        {app.status === 'Completed' ? 'Settled' : 'Unpaid/Due'}
                      </span>
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

export default DoctorEarnings;
