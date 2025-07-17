const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Remove excessive logging

    // Get User model from global db
    const User = global.db.User;
    if (!User) {
      return res.status(500).json({ success: false, message: 'Database initialization error' });
    }

    const user = await User.findOne({
      where: { email },
      raw: true
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    let isPasswordMatch = false;
    if (password === user.password) {
      isPasswordMatch = true;
    } else if (await bcrypt.compare(password, user.password)) {
      isPasswordMatch = true;
    }

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.status !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        companyId: user.companyId
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-pacehrm',
    );

    res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error in login'
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
      return res.status(500).json({ success: false, message: 'Database initialization error' });
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
    res.status(500).json({
      success: false,
      message: error.message || 'Error in getting user details'
    });
  }
};
