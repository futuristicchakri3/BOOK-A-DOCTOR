import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load patients list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this patient user and all their scheduled appointments? This action is irreversible.')) return;
    
    try {
      const res = await axios.delete(`/api/admin/user/${id}`);
      if (res.data.success) {
        toast.success('Patient account deleted successfully.');
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete patient account.');
    }
  };

  if (loading) {
    return <Loader minHeight="60vh" />;
  }

  return (
    <div className="container py-5 mt-5">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Manage Patients</h2>
        <p className="text-secondary small">View and manage registered patient accounts on the Book a Doctor portal.</p>
      </div>

      <div className="card glass-card p-4 border-0">
        <h5 className="fw-bold text-dark mb-3">
          <i className="bi bi-people-fill text-primary me-2"></i> Patient Accounts ({users.length})
        </h5>

        {users.length === 0 ? (
          <div className="alert alert-secondary small text-center mb-0">No registered patients found in database.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="small text-secondary">
                  <th>Patient Picture</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Age / Gender</th>
                  <th>Registered On</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="small">
                    <td>
                      <img
                        src={u.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=60'}
                        alt={u.name}
                        className="rounded-circle border"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                    </td>
                    <td className="fw-bold text-dark">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || 'N/A'}</td>
                    <td>
                      {u.age || 'N/A'} yrs • {u.gender || 'N/A'}
                    </td>
                    <td className="text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(u._id)}
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

export default ManageUsers;
