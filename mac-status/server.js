const http = require('http');
const { execSync } = require('child_process');

const PORT = 3999;

function getSystemStats() {
  try {
    const cpu = execSync('sysctl -n hw.ncpu').toString().trim();
    const cpuBrand = execSync('sysctl -n machdep.cpu.brand_string').toString().trim();
    const memTotal = parseInt(execSync('sysctl -n hw.memsize').toString().trim()) / 1024 / 1024 / 1024;
    const disk = execSync('df -h / | tail -1').toString().trim().split(/\s+/);
    const uptime = execSync('uptime').toString().trim();
    const hostname = execSync('hostname').toString().trim();
    
    return {
      cpu: { cores: cpu, brand: cpuBrand },
      memory: { total: memTotal.toFixed(2), unit: 'GB' },
      disk: { size: disk[1], used: disk[2], available: disk[3], percent: disk[4] },
      uptime: uptime,
      hostname: hostname
    };
  } catch (e) {
    return { error: e.message };
  }
}

function getPM2Status() {
  try {
    const pm2List = execSync('pm2 jlist 2>/dev/null || echo "[]"').toString();
    return JSON.parse(pm2List);
  } catch (e) {
    return [];
  }
}

function generateHTML() {
  const stats = getSystemStats();
  const pm2Procs = getPM2Status();
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Mac Mini Status</title>
  <meta http-equiv="refresh" content="5">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: #fff;
      min-height: 100vh;
      padding: 40px;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 10px;
      background: linear-gradient(90deg, #c9a227, #e8c547);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { color: #6b7280; margin-bottom: 40px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      max-width: 1200px;
    }
    .card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 24px;
      backdrop-filter: blur(10px);
    }
    .card h2 {
      font-size: 1.2rem;
      color: #c9a227;
      margin-bottom: 16px;
    }
    .stat {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .stat:last-child { border-bottom: none; }
    .stat-label { color: #8b9dc3; }
    .stat-value { color: #22c55e; font-weight: 600; }
    .process {
      background: rgba(34, 197, 94, 0.1);
      border-left: 3px solid #22c55e;
      padding: 12px;
      margin: 8px 0;
      border-radius: 0 8px 8px 0;
    }
    .process-name { font-weight: 600; color: #22c55e; }
    .process-status { font-size: 0.85rem; color: #6b7280; }
    .timestamp {
      position: fixed;
      bottom: 20px;
      right: 20px;
      color: #6b7280;
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <h1>Mac Mini Status</h1>
  <p class="subtitle">Live system dashboard - M4 - 16GB RAM</p>
  
  <div class="grid">
    <div class="card">
      <h2>System Info</h2>
      <div class="stat">
        <span class="stat-label">Hostname</span>
        <span class="stat-value">${stats.hostname || 'Unknown'}</span>
      </div>
      <div class="stat">
        <span class="stat-label">CPU</span>
        <span class="stat-value">${stats.cpu?.brand || 'Unknown'}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Cores</span>
        <span class="stat-value">${stats.cpu?.cores || '?'}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Memory</span>
        <span class="stat-value">${stats.memory?.total || '?'} GB</span>
      </div>
    </div>
    
    <div class="card">
      <h2>Disk Usage</h2>
      <div class="stat">
        <span class="stat-label">Total</span>
        <span class="stat-value">${stats.disk?.size || '?'}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Used</span>
        <span class="stat-value">${stats.disk?.used || '?'}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Available</span>
        <span class="stat-value">${stats.disk?.available || '?'}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Usage</span>
        <span class="stat-value">${stats.disk?.percent || '?'}</span>
      </div>
    </div>
    
    <div class="card">
      <h2>PM2 Processes</h2>
      ${pm2Procs.length === 0 ? '<p style="color: #6b7280;">No PM2 processes running</p>' : 
        pm2Procs.map(p => `
          <div class="process">
            <div class="process-name">${p.name}</div>
            <div class="process-status">Status: ${p.pm2_env?.status || 'unknown'}</div>
          </div>
        `).join('')}
    </div>
    
    <div class="card">
      <h2>System Uptime</h2>
      <div class="stat">
        <span class="stat-label">Current</span>
        <span class="stat-value" style="font-size: 0.9rem;">${stats.uptime || 'Unknown'}</span>
      </div>
    </div>
  </div>
  
  <div class="timestamp">Last updated: ${new Date().toLocaleString()}</div>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(generateHTML());
});

server.listen(PORT, () => {
  console.log('Mac Mini Status Dashboard running on http://localhost:' + PORT);
});
