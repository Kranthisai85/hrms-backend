const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
  try {
    console.log('\nAuth Middleware - Incoming Request:');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found:', token.substring(0, 20) + '...');
    } else {
      console.log('No Bearer token found in Authorization header');
      console.log('Authorization header:', req.headers.authorization);
    }

    // Check if token exists
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      console.log('Verifying token...');
      const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-pacehrm';
      console.log('Using secret:', secret.substring(0, 10) + '...');
      
      const decoded = jwt.verify(token, secret);
      console.log('Token verified successfully:', decoded);

      // Add user info to request
      req.user = decoded;
      console.log('User added to request:', req.user);
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
    console.log('User role:', req.user.role);
    console.log('Required roles:', roles);
    
    if (!roles.includes(req.user.role)) {
      console.log('Role not authorized');
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    console.log('Role authorized');
    next();
  };
};
