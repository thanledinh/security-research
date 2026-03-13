/**
 * Hidden Path Discovery — Brute Force
 * 
 * Usage: node bruteforce_paths.js
 */

const fs = require('fs');

// ============ CẤU HÌNH ============
const TARGETS = [
    'https://TARGET_API_DOMAIN',
];
const TOKEN = 'YOUR_JWT_TOKEN_HERE';
const CONCURRENCY = 5;
// ==================================

const PATHS = [
    // Config files
    '/.env', '/.env.local', '/.env.production', '/.env.backup',
    '/.git/config', '/.git/HEAD', '/.gitignore',
    '/config.json', '/config.yaml', '/config.yml',
    '/wp-config.php', '/.htpasswd', '/.htaccess',
    
    // Debug
    '/debug', '/debug/vars', '/debug/pprof/', '/debug/pprof/heap',
    '/metrics', '/prometheus', '/actuator/health',
    '/phpinfo.php', '/server-info', '/server-status',
    
    // API
    '/health', '/api', '/api/v1', '/api/v2', '/api/docs',
    '/swagger', '/swagger.json', '/swagger-ui',
    '/graphql', '/graphiql',
    
    // Admin
    '/admin', '/admin/login', '/administrator',
    '/panel', '/dashboard', '/console',
    '/manager', '/management',
    
    // Auth
    '/login', '/signin', '/register', '/signup',
    '/auth', '/oauth', '/sso',
    '/forgot-password', '/reset-password',
    
    // Files
    '/robots.txt', '/sitemap.xml', '/crossdomain.xml',
    '/favicon.ico', '/.well-known/security.txt',
    '/backup', '/backups', '/dump', '/export',
    '/upload', '/uploads', '/files', '/media',
    
    // Languages/frameworks
    '/wp-admin', '/wp-login.php',
    '/phpmyadmin', '/adminer',
    '/artisan', '/telescope',
];

async function testPath(baseUrl, path) {
    const url = `${baseUrl}${path}`;
    try {
        const res = await fetch(url, {
            headers: TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {},
            redirect: 'manual',
            signal: AbortSignal.timeout(8000),
        });
        
        if (res.status !== 404 && res.status !== 403) {
            return { path, status: res.status, url };
        }
    } catch {}
    return null;
}

async function main() {
    console.log('═'.repeat(50));
    console.log('  PATH BRUTE FORCE');
    console.log('═'.repeat(50) + '\n');

    for (const target of TARGETS) {
        console.log(`\n── ${target} ──\n`);
        const found = [];

        for (let i = 0; i < PATHS.length; i += CONCURRENCY) {
            const batch = PATHS.slice(i, i + CONCURRENCY);
            const results = await Promise.all(batch.map(p => testPath(target, p)));
            results.filter(Boolean).forEach(r => {
                console.log(`  ✅ [${r.status}] ${r.path}`);
                found.push(r);
            });
        }

        console.log(`\n  Found: ${found.length} paths (${PATHS.length} tested)`);
    }
}

main().catch(console.error);
