const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const AUDIT_DB_PATH = process.env.AUDIT_DB_PATH || path.join(DATA_DIR, 'activity-log.json');
const MAX_EVENTS = Number(process.env.AUDIT_MAX_EVENTS || 500);

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(AUDIT_DB_PATH)) {
    fs.writeFileSync(AUDIT_DB_PATH, '[]');
  }
}

function readEvents() {
  ensureStore();
  const raw = fs.readFileSync(AUDIT_DB_PATH, 'utf8');
  const events = JSON.parse(raw || '[]');
  return Array.isArray(events) ? events : [];
}

function writeEvents(events) {
  ensureStore();
  fs.writeFileSync(AUDIT_DB_PATH, JSON.stringify(events.slice(0, MAX_EVENTS), null, 2));
}

function actorFromReq(req) {
  if (!req || !req.user) {
    return { username: 'system', displayName: 'System', role: 'system' };
  }
  return {
    id: req.user.id,
    username: req.user.sub,
    displayName: req.user.displayName || req.user.sub,
    role: req.user.role || 'staff'
  };
}

function record(req, action, details) {
  const events = readEvents();
  const event = {
    id: String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8),
    at: new Date().toISOString(),
    actor: actorFromReq(req),
    action,
    details: details || {}
  };
  writeEvents([event].concat(events));
  return event;
}

function listEvents(limit) {
  const count = Math.max(1, Math.min(Number(limit || 50), 200));
  return readEvents().slice(0, count);
}

module.exports = {
  listEvents,
  record
};
