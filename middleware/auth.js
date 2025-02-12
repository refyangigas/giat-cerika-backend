const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Perlu diubah karena Flutter mengirim dengan format 'Bearer token'
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Extract token dari format 'Bearer token'
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};