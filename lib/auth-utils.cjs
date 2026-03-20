const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'smartinvest_fallback_secret';

async function verifyToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    const err = new Error('No token provided');
    err.status = 401;
    throw err;
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch {
    const err = new Error('Invalid or expired token');
    err.status = 401;
    throw err;
  }
}

function send(res, status, data) {
  if (!res.headersSent) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
  }
  res.end(JSON.stringify(data));
}

module.exports = { verifyToken, send, JWT_SECRET };
