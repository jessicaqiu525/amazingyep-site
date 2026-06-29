const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userStore = require('./userStore');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AmazingYep2026!';
const JWT_SECRET = process.env.JWT_SECRET || 'amazingyep-local-admin-secret-change-before-launch';
const TOKEN_TTL = process.env.ADMIN_TOKEN_TTL || '12h';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(ADMIN_PASSWORD, 10);

function signToken(user) {
  const account = user || { id: ADMIN_USER, username: ADMIN_USER, role: 'admin', displayName: 'Administrator' };
  return jwt.sign({
    sub: account.username,
    id: account.id,
    role: account.role || 'staff',
    displayName: account.displayName || account.username
  }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function verifyCredentials(username, password) {
  const storedUser = userStore.verifyCredentials(username, password);
  if (storedUser) return storedUser;

  if (String(username || '') === ADMIN_USER && bcrypt.compareSync(String(password || ''), ADMIN_PASSWORD_HASH)) {
    return { id: 'admin', username: ADMIN_USER, displayName: 'Administrator', role: 'admin', active: true };
  }

  return null;
}

function requireAuth(req, res, next) {
  const auth = req.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!token) {
    res.status(401).json({ error: 'Login required.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const account = userStore.findUser(decoded.sub);
    if (!account || account.active === false) {
      res.status(401).json({ error: 'Your account is no longer active. Please contact an admin.' });
      return;
    }
    req.user = {
      ...decoded,
      id: account.id,
      role: account.role || decoded.role || 'staff',
      displayName: account.displayName || decoded.displayName || account.username
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Your login expired. Please sign in again.' });
  }
}

function optionalAuth(req, res, next) {
  const auth = req.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const account = userStore.findUser(decoded.sub);
    if (account && account.active !== false) {
      req.user = {
        ...decoded,
        id: account.id,
        role: account.role || decoded.role || 'staff',
        displayName: account.displayName || decoded.displayName || account.username
      };
    }
  } catch (error) {
    // Public product reads should still work when no valid admin token is present.
  }

  next();
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
    return;
  }
  res.status(403).json({ error: 'Admin permission is required.' });
}

module.exports = {
  ADMIN_USER,
  optionalAuth,
  requireAdmin,
  signToken,
  verifyCredentials,
  requireAuth
};
