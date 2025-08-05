const domainAuth = async (req, res, next) => {
  try {
    // Get frontend host from headers (sent by frontend)
    const frontendHost = req.headers['x-frontend-host'] || req.headers['origin']?.replace(/^https?:\/\//, '') || req.get('host');
    
    console.log('Frontend host:', frontendHost);
    console.log('Backend host:', req.get('host'));
    
    // Skip domain validation for health check and certain public endpoints
    if (req.path === '/health' || req.path === '/auth/login') {
      return next();
    }

    // Handle localhost and development environments
    if (frontendHost.includes('localhost') || frontendHost.includes('127.0.0.1')) {
      console.log('Development environment detected, skipping domain validation');
      return next();
    }

    const { Company } = global.db;
    if (!Company) {
      return res.status(500).json({
        success: false,
        message: 'Database models not initialized'
      });
    }

    // Find company by frontend domain
    const company = await Company.findOne({
      where: { domainName: frontendHost }
    });

    if (!company) {
      console.log(`Domain validation failed for frontend host: ${frontendHost}`);
      return res.status(403).json({
        success: false,
        message: 'Invalid domain or company not found',
        domain: frontendHost
      });
    }

    console.log(`Domain validation successful for company: ${company.name} (${frontendHost})`);
    
    // Attach company to request for later use
    req.company = company;
    next();
  } catch (error) {
    console.error('Domain validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Domain validation failed'
    });
  }
};

module.exports = domainAuth; 