const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Import bcrypt for hashed password comparison

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password: '***' });
    console.log('Raw request body:', req.body);

    // Get User model from global db
    const User = global.db.User;
    if (!User) {
      console.error('User model not found in global.db');
      throw new Error('Database initialization error');
    }

    console.log('Finding user:', email);
    const user = await User.findOne({
      where: { email },
      raw: true // Fetch plain object instead of Sequelize instance
    });

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    });

    // Compare plain text passwords
    console.log('Checking password...');
    console.log('Provided password:', password);
    console.log('Stored password:', user.password);

    let isPasswordMatch = false;

    // First, check if the password matches as plain text
    if (password === user.password) {
      console.log('Password matched as plain text');
      isPasswordMatch = true;
    } else {
      // If plain text comparison fails, check if the stored password is hashed
      console.log('Plain text password did not match. Checking hashed password...');
      if (await bcrypt.compare(password, user.password)) {
        console.log('Password matched as hashed');
        isPasswordMatch = true;
      }
    }

    if (!isPasswordMatch) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (user.status !== 'Active') {
      console.log('Inactive user attempted login:', email);
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Generate JWT token
    console.log('Generating token...');
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-pacehrm',
      // { expiresIn: '1d' }
    );

    console.log('Login successful:', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    res.status(500).json({
      success: false,
      message: 'Error in login',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        type: error.name
      } : undefined
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const User = global.db.User;
    if (!User) {
      throw new Error('Database initialization error');
    }

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in getting user details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
