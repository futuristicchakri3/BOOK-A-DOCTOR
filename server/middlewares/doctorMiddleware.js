const doctor = (req, res, next) => {
  if (req.user && req.user.role === 'DOCTOR') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Doctor permissions required.',
    });
  }
};

module.exports = { doctor };
