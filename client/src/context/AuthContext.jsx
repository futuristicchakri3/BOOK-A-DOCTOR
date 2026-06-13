import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check user session from LocalStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          // Set authorization header globally for axios
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
          
          // Verify with server to ensure token is valid and user exists
          const response = await axios.get('/api/auth/profile');
          if (response.data.success) {
            // Update token if response returned a refreshed state, or keep same
            const fullProfile = response.data.data;
            const updatedUser = {
              ...parsed,
              name: fullProfile.user.name,
              email: fullProfile.user.email,
              phone: fullProfile.user.phone,
              gender: fullProfile.user.gender,
              age: fullProfile.user.age,
              profilePic: fullProfile.user.profilePic,
              isApproved: fullProfile.doctorDetails ? fullProfile.doctorDetails.isApproved : parsed.isApproved,
            };
            setUser(updatedUser);
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
          } else {
            logout();
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login action
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        return { success: true, data: userData };
      }
    } catch (error) {
      console.error('Login service error:', error);
      const errMsg = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: errMsg };
    }
  };

  // Register action
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      if (res.data.success) {
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        return { success: true, data: userData };
      }
    } catch (error) {
      console.error('Registration service error:', error);
      const errMsg = error.response?.data?.message || 'Registration failed.';
      return { success: false, message: errMsg };
    }
  };

  // Logout action
  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Update profile locally & push to state
  const syncLocalProfile = (updatedProfile) => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const newUserData = { ...parsed, ...updatedProfile };
      setUser(newUserData);
      localStorage.setItem('userInfo', JSON.stringify(newUserData));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, syncLocalProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
