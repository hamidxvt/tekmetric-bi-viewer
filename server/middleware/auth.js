const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Redirect to AI Center login, passing our SSO callback URL
    return res.redirect(buildAICenterLoginUrl(req.originalUrl));
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.clearCookie('token');
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.redirect(buildAICenterLoginUrl(req.originalUrl));
  }
}

function buildAICenterLoginUrl(originalUrl) {
  const callbackUrl = `${process.env.APP_URL}/api/auth/sso-callback`;
  const params = new URLSearchParams({
    redirect: callbackUrl,
    app_redirect: originalUrl || '/',
  });
  return `${process.env.AI_CENTER_URL}?${params.toString()}`;
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
