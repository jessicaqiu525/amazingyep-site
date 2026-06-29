const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USER_DB_PATH = process.env.USER_DB_PATH || path.join(DATA_DIR, 'users.json');
const DEFAULT_ADMIN_USER = process.env.ADMIN_USER || 'admin';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AmazingYep2026!';
const DEFAULT_ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);

function nowIso() {
  return new Date().toISOString();
}

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USER_DB_PATH)) {
    const createdAt = nowIso();
    writeUsersRaw([{
      id: 'admin',
      username: DEFAULT_ADMIN_USER,
      displayName: 'Administrator',
      role: 'admin',
      active: true,
      passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
      createdAt,
      updatedAt: createdAt
    }]);
  }
}

function readUsersRaw() {
  ensureStore();
  const raw = fs.readFileSync(USER_DB_PATH, 'utf8');
  const users = JSON.parse(raw || '[]');
  return Array.isArray(users) ? users : [];
}

function writeUsersRaw(users) {
  fs.writeFileSync(USER_DB_PATH, JSON.stringify(users, null, 2));
}

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

function listUsers() {
  return readUsersRaw().map(publicUser);
}

function findUser(usernameOrId) {
  const target = String(usernameOrId || '').trim().toLowerCase();
  if (!target) return null;
  return readUsersRaw().find((user) => {
    return [user.id, user.username].some((value) => String(value || '').trim().toLowerCase() === target);
  }) || null;
}

function verifyCredentials(username, password) {
  const user = findUser(username);
  if (!user || user.active === false) return null;
  const ok = bcrypt.compareSync(String(password || ''), user.passwordHash || '');
  return ok ? publicUser(user) : null;
}

function nextId(username) {
  const slug = String(username || 'user').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '');
  return slug || String(Date.now());
}

function saveUser(input) {
  const users = readUsersRaw();
  const username = String(input.username || '').trim();
  if (!username) throw new Error('Username is required.');

  const target = String(input.id || username).trim().toLowerCase();
  const index = users.findIndex((user) => {
    return [user.id, user.username].some((value) => String(value || '').trim().toLowerCase() === target);
  });

  if (index < 0 && !input.password) {
    throw new Error('Password is required for a new user.');
  }

  const existing = index >= 0 ? users[index] : null;
  const updatedAt = nowIso();
  const next = {
    ...(existing || {}),
    id: (existing && existing.id) || nextId(username),
    username,
    displayName: String(input.displayName || username).trim(),
    role: input.role === 'admin' ? 'admin' : 'staff',
    active: input.active !== false,
    updatedAt,
    createdAt: (existing && existing.createdAt) || updatedAt,
    passwordHash: input.password ? bcrypt.hashSync(String(input.password), 10) : existing.passwordHash
  };

  if (index >= 0) {
    users[index] = next;
  } else {
    users.push(next);
  }

  writeUsersRaw(users);
  return publicUser(next);
}

function setUserActive(id, active) {
  const users = readUsersRaw();
  const target = String(id || '').trim().toLowerCase();
  const index = users.findIndex((user) => String(user.id || '').trim().toLowerCase() === target);
  if (index < 0) return null;

  const user = users[index];
  if (user.role === 'admin' && active === false) {
    const activeAdmins = users.filter((item) => item.role === 'admin' && item.active !== false);
    if (activeAdmins.length <= 1) {
      throw new Error('At least one active admin account is required.');
    }
  }

  users[index] = { ...user, active: Boolean(active), updatedAt: nowIso() };
  writeUsersRaw(users);
  return publicUser(users[index]);
}

module.exports = {
  listUsers,
  findUser,
  publicUser,
  saveUser,
  setUserActive,
  verifyCredentials
};
