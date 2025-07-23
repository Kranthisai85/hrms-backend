const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    try {
      const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-pacehrm';
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking authorization'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('\nAuthorize Middleware:');
    console.log('User role:', req.user);
    console.log('Required roles:', roles);

    if (req.user.role === 'super_admin') {
      console.log('super_admin access granted');
      return next();
    }
    console.log('req.user.role', req.user.role);
    console.log('roles', roles);
    if (!roles.includes(req.user.role)) {
      console.log('Role not authorized');
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    console.log('Role authorized');
    next();
  };
};
