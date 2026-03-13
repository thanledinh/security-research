/**
 * Direct IP Testing — Cloudflare Bypass
 * 
 * Gửi HTTP requests trực tiếp đến IP thật (bypass CDN/WAF)
 * bằng cách sử dụng Host header spoofing.
 * 
 * Usage: node test_real_ip.js
 */

const https = require('https');

// ============ CẤU HÌNH ============
const REAL_IP = 'TARGET_IP_HERE';
const DOMAIN = 'target.domain.com';
const TOKEN = 'YOUR_JWT_TOKEN_HERE';
// ==================================

const PORTS = [80, 443, 3000, 8000, 8080, 8443, 9000, 9090];

const PATHS_TO_TEST = [
    '/',
    '/api',
    '/api/v1',
    '/admin',
    '/login',
    '/health',
    '/status',
    '/swagger',
    '/.env',
    '/debug/pprof/',
];

function makeRequest(ip, port, path, host) {
    return new Promise((resolve) => {
        const protocol = port === 80 ? require('http') : https;
        const options = {
            hostname: ip,
            port: port,
            path: path,
            method: 'GET',
            headers: {
                'Host': host,
                'Authorization': `Bearer ${TOKEN}`,
            },
            rejectUnauthorized: false,
            timeout: 10000,
        };

        const req = protocol.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ port, path, status: res.statusCode, data: data.substring(0, 200) }));
        });
        
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
        req.end();
    });
}

async function main() {
    console.log('═'.repeat(50));
    console.log(`  DIRECT IP TEST: ${REAL_IP}`);
    console.log(`  Host: ${DOMAIN}`);
    console.log('═'.repeat(50) + '\n');

    // Port scan
    console.log('── Port Scan ──\n');
    for (const port of PORTS) {
        const result = await makeRequest(REAL_IP, port, '/', DOMAIN);
        if (result) {
            console.log(`  ✅ Port ${port}: [${result.status}] ${result.data.substring(0, 80)}`);
        } else {
            console.log(`  ❌ Port ${port}: timeout/closed`);
        }
    }

    // Path test on open ports
    console.log('\n── Path Test ──\n');
    for (const path of PATHS_TO_TEST) {
        const result = await makeRequest(REAL_IP, 8080, path, DOMAIN);
        if (result) {
            console.log(`  [${result.status}] ${path}: ${result.data.substring(0, 100)}`);
        }
    }
}

main().catch(console.error);
