const protect = require('./auth');

module.exports = async (req, res, next) => {
  await protect(req, res, async () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  });
};
