const http = require('http');
const url = require('url');

const handlers = {
  'POST /api/auth/register':       require('./api/auth/register.cjs'),
  'POST /api/auth/login':          require('./api/auth/login.cjs'),
  'GET /api/auth/me':              require('./api/auth/me.cjs'),
  'GET /api/packages':             require('./api/packages/index.cjs'),
  'POST /api/packages/invest':     require('./api/packages/invest.cjs'),
  'GET /api/investments':          require('./api/investments/index.cjs'),
  'GET /api/investments/active':   require('./api/investments/active.cjs'),
  'GET /api/investments/summary':  require('./api/investments/summary.cjs'),
  'GET /api/dashboard':            require('./api/dashboard/index.cjs'),
  'GET /api/dashboard/portfolio':  require('./api/dashboard/portfolio.cjs'),
  'POST /api/wallet/fund':         require('./api/wallet/fund.cjs'),
  'POST /api/wallet/withdraw':     require('./api/wallet/withdraw.cjs'),
  'GET /api/wallet/transactions':  require('./api/wallet/transactions.cjs'),
  'GET /api/referrals':            require('./api/referrals/index.cjs'),
  'POST /api/init':                require('./api/init/index.cjs'),
  'GET /api/cron':                 require('./api/cron/index.cjs'),
};

const dynamicRoutes = [
  {
    pattern: /^GET \/api\/wallet\/verify\/(.+)$/,
    handler: require('./api/wallet/verify/[reference].cjs'),
    params: ['reference']
  }
];

const PORT = process.env.PORT || 3001;

async function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk.toString(); });
    req.on('end', () => {
      try { req.body = JSON.parse(data); } catch { req.body = {}; }
      resolve();
    });
    req.on('error', () => { req.body = {}; resolve(); });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsed = url.parse(req.url, true);
  req.query = parsed.query;
  const pathname = parsed.pathname;

  await parseBody(req);

  const key = `${req.method} ${pathname}`;

  if (handlers[key]) {
    try { await handlers[key](req, res); } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
    return;
  }

  for (const { pattern, handler, params } of dynamicRoutes) {
    const match = key.match(pattern);
    if (match) {
      params.forEach((p, i) => { req.query[p] = match[i + 1]; });
      try { await handler(req, res); } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
      return;
    }
  }

  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'SmartInvest API is running' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`✓ SmartInvest API running on port ${PORT}`);
});
