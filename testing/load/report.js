/**
 * Artillery Load Test Report Generator
 * Converts JSON results to readable HTML report
 */

const fs = require('fs');
const path = require('path');

// Load results
const resultsPath = path.join(__dirname, '../reports/load-report.json');
const outputPath = path.join(__dirname, '../reports/load-report.html');

function generateReport() {
  console.log('📊 Generating Load Test Report...\n');

  // Check if results file exists
  if (!fs.existsSync(resultsPath)) {
    console.error('❌ No results file found. Run load tests first.');
    console.log('   npm run test:load');
    process.exit(1);
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  const aggregate = results.aggregate;

  // Calculate summary stats
  const summary = {
    totalRequests: aggregate.counters?.['http.requests'] || 0,
    successfulRequests: aggregate.counters?.['http.codes.200'] || 0,
    failedRequests: aggregate.counters?.['http.requests'] - (aggregate.counters?.['http.codes.200'] || 0),
    avgResponseTime: aggregate.summaries?.['http.response_time']?.mean?.toFixed(2) || 'N/A',
    p50ResponseTime: aggregate.summaries?.['http.response_time']?.p50?.toFixed(2) || 'N/A',
    p95ResponseTime: aggregate.summaries?.['http.response_time']?.p95?.toFixed(2) || 'N/A',
    p99ResponseTime: aggregate.summaries?.['http.response_time']?.p99?.toFixed(2) || 'N/A',
    minResponseTime: aggregate.summaries?.['http.response_time']?.min?.toFixed(2) || 'N/A',
    maxResponseTime: aggregate.summaries?.['http.response_time']?.max?.toFixed(2) || 'N/A',
    rps: aggregate.rates?.['http.request_rate']?.toFixed(2) || 'N/A',
  };

  // Calculate error rate
  summary.errorRate = summary.totalRequests > 0 
    ? ((summary.failedRequests / summary.totalRequests) * 100).toFixed(2) 
    : '0';

  // Determine status
  const status = summary.errorRate < 1 && summary.p95ResponseTime < 2000 ? 'PASS' : 'FAIL';
  const statusColor = status === 'PASS' ? '#22c55e' : '#ef4444';

  // Print console summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('                   LOAD TEST RESULTS                        ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Status:              ${status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Total Requests:      ${summary.totalRequests.toLocaleString()}`);
  console.log(`  Successful:          ${summary.successfulRequests.toLocaleString()}`);
  console.log(`  Failed:              ${summary.failedRequests.toLocaleString()}`);
  console.log(`  Error Rate:          ${summary.errorRate}%`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Response Times (ms):');
  console.log(`    Average:           ${summary.avgResponseTime}`);
  console.log(`    p50:               ${summary.p50ResponseTime}`);
  console.log(`    p95:               ${summary.p95ResponseTime}`);
  console.log(`    p99:               ${summary.p99ResponseTime}`);
  console.log(`    Min:               ${summary.minResponseTime}`);
  console.log(`    Max:               ${summary.maxResponseTime}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Requests/sec:        ${summary.rps}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Generate HTML report
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JOCstudio Load Test Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #1a1a2e; color: #eee; padding: 40px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 8px; }
    .subtitle { color: #888; margin-bottom: 32px; }
    .status { display: inline-block; padding: 8px 24px; border-radius: 8px; font-weight: bold; background: ${statusColor}; color: white; margin-bottom: 32px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .card { background: #252542; padding: 24px; border-radius: 12px; }
    .card-label { color: #888; font-size: 0.875rem; margin-bottom: 8px; }
    .card-value { font-size: 2rem; font-weight: bold; }
    .card-unit { color: #888; font-size: 1rem; }
    .section { margin-top: 32px; }
    .section-title { font-size: 1.25rem; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; background: #252542; border-radius: 12px; overflow: hidden; }
    th, td { padding: 16px; text-align: left; border-bottom: 1px solid #333; }
    th { background: #1e1e35; font-weight: 500; }
    .good { color: #22c55e; }
    .warning { color: #eab308; }
    .bad { color: #ef4444; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔥 Load Test Report</h1>
    <p class="subtitle">JOCstudio API Performance Test Results</p>
    
    <div class="status">${status}</div>
    
    <div class="grid">
      <div class="card">
        <div class="card-label">Total Requests</div>
        <div class="card-value">${summary.totalRequests.toLocaleString()}</div>
      </div>
      <div class="card">
        <div class="card-label">Success Rate</div>
        <div class="card-value ${parseFloat(summary.errorRate) < 1 ? 'good' : 'bad'}">${(100 - parseFloat(summary.errorRate)).toFixed(2)}<span class="card-unit">%</span></div>
      </div>
      <div class="card">
        <div class="card-label">Avg Response Time</div>
        <div class="card-value">${summary.avgResponseTime}<span class="card-unit">ms</span></div>
      </div>
      <div class="card">
        <div class="card-label">Requests/sec</div>
        <div class="card-value">${summary.rps}</div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">Response Time Distribution</h2>
      <table>
        <tr>
          <th>Percentile</th>
          <th>Response Time</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>p50 (Median)</td>
          <td>${summary.p50ResponseTime} ms</td>
          <td class="${parseFloat(summary.p50ResponseTime) < 500 ? 'good' : parseFloat(summary.p50ResponseTime) < 1000 ? 'warning' : 'bad'}">${parseFloat(summary.p50ResponseTime) < 500 ? '✓ Good' : parseFloat(summary.p50ResponseTime) < 1000 ? '⚠ Acceptable' : '✗ Slow'}</td>
        </tr>
        <tr>
          <td>p95</td>
          <td>${summary.p95ResponseTime} ms</td>
          <td class="${parseFloat(summary.p95ResponseTime) < 1000 ? 'good' : parseFloat(summary.p95ResponseTime) < 2000 ? 'warning' : 'bad'}">${parseFloat(summary.p95ResponseTime) < 1000 ? '✓ Good' : parseFloat(summary.p95ResponseTime) < 2000 ? '⚠ Acceptable' : '✗ Slow'}</td>
        </tr>
        <tr>
          <td>p99</td>
          <td>${summary.p99ResponseTime} ms</td>
          <td class="${parseFloat(summary.p99ResponseTime) < 2000 ? 'good' : parseFloat(summary.p99ResponseTime) < 5000 ? 'warning' : 'bad'}">${parseFloat(summary.p99ResponseTime) < 2000 ? '✓ Good' : parseFloat(summary.p99ResponseTime) < 5000 ? '⚠ Acceptable' : '✗ Slow'}</td>
        </tr>
        <tr>
          <td>Min</td>
          <td>${summary.minResponseTime} ms</td>
          <td>-</td>
        </tr>
        <tr>
          <td>Max</td>
          <td>${summary.maxResponseTime} ms</td>
          <td>-</td>
        </tr>
      </table>
    </div>
    
    <div class="section">
      <h2 class="section-title">Performance Thresholds</h2>
      <table>
        <tr>
          <th>Metric</th>
          <th>Target</th>
          <th>Actual</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>Error Rate</td>
          <td>&lt; 1%</td>
          <td>${summary.errorRate}%</td>
          <td class="${parseFloat(summary.errorRate) < 1 ? 'good' : 'bad'}">${parseFloat(summary.errorRate) < 1 ? '✓ Pass' : '✗ Fail'}</td>
        </tr>
        <tr>
          <td>p95 Response Time</td>
          <td>&lt; 2000ms</td>
          <td>${summary.p95ResponseTime} ms</td>
          <td class="${parseFloat(summary.p95ResponseTime) < 2000 ? 'good' : 'bad'}">${parseFloat(summary.p95ResponseTime) < 2000 ? '✓ Pass' : '✗ Fail'}</td>
        </tr>
        <tr>
          <td>Availability</td>
          <td>&gt; 99%</td>
          <td>${(100 - parseFloat(summary.errorRate)).toFixed(2)}%</td>
          <td class="${(100 - parseFloat(summary.errorRate)) > 99 ? 'good' : 'bad'}">${(100 - parseFloat(summary.errorRate)) > 99 ? '✓ Pass' : '✗ Fail'}</td>
        </tr>
      </table>
    </div>
    
    <p style="margin-top: 40px; color: #666; font-size: 0.875rem;">
      Generated: ${new Date().toISOString()}
    </p>
  </div>
</body>
</html>
`;

  fs.writeFileSync(outputPath, html);
  console.log(`✅ HTML report saved to: ${outputPath}`);
}

// Run if executed directly
if (require.main === module) {
  generateReport();
}

module.exports = { generateReport };
