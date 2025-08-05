const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Get frontend host from headers (sent by frontend)
    const frontendHost = req.headers['x-frontend-host'] || req.headers['origin']?.replace(/^https?:\/\//, '') || req.get('host');

    console.log('Login - Frontend host:', frontendHost);
    console.log('Login - Backend host:', req.get('host'));

    // Get User and Company models from global db
    const { User, Company } = global.db;
    if (!User || !Company) {
      return res.status(500).json({ success: false, message: 'Database initialization error' });
    }
    let company;
    // Skip domain validation for development environment
    if (frontendHost.includes('localhost') || frontendHost.includes('127.0.0.1')) {
      console.log('Development environment detected, skipping domain validation');
      
      // For development, find any company or create a default one
      company = await Company.findOne();
      if (!company) {
        console.log('No company found in development, proceeding without company validation');
        // Continue without company validation for development
      }
    } else {
      // Production: validate domain
      company = await Company.findOne({
        where: { domainName: frontendHost }
      });

      if (!company) {
        return res.status(403).json({
          success: false,
          message: 'Invalid domain or company not found',
          domain: frontendHost
        });
      }
    }

    // Find user with company validation
    let userQuery = { email: email };
    // Add company validation only if company exists (production) or if we have a company in development
    if (company && company.id) {
      userQuery.companyId = company.id;
    }
    
    const user = await User.findOne({
      where: userQuery,
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
        companyId: user.companyId,
        domain: frontendHost // Include frontend domain in token for additional validation
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-pacehrm',
    );

    // Prepare response with company info if available
    const responseData = {
      success: true,
      token,
      user
    };

    // Add company info to response if company exists
    if (company) {
      responseData.company = {
        id: company.id,
        name: company.name,
        domain: company.domainName
      };
    }

    res.json(responseData);
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
