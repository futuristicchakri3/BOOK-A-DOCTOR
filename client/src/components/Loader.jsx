import React from 'react';

const Loader = ({ minHeight = '300px' }) => {
  return (
    <div 
      className="d-flex flex-column justify-content-center align-items-center w-100" 
      style={{ minHeight }}
    >
      <div className="custom-spinner mb-3"></div>
      <p className="text-secondary fw-semibold">Loading data, please wait...</p>
    </div>
  );
};

export default Loader;
