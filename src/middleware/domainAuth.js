const domainAuth = async (req, res, next) => {
  try {
    const host = req.get('host'); // Gets the domain from request (e.g., "pss.pacehrm.com")
    
    // Skip domain validation for health check and certain public endpoints
    if (req.path === '/health' || req.path === '/auth/login') {
      return next();
    }

    // Handle localhost and development environments
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
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

    // Find company by domain
    const company = await Company.findOne({
      where: { domainName: host }
    });

    if (!company) {
      console.log(`Domain validation failed for host: ${host}`);
      return res.status(403).json({
        success: false,
        message: 'Invalid domain or company not found',
        domain: host
      });
    }

    console.log(`Domain validation successful for company: ${company.name} (${host})`);
    
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