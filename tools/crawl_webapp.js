/**
 * Web Application Crawler — Cloudflare WAF Bypass
 * 
 * Kết nối đến Chrome instance đã có session (bypass WAF),
 * tải và phân tích tất cả JS bundles để tìm:
 * - API endpoints
 * - Authentication patterns
 * - Potential secrets
 * - Internal routes
 * 
 * Usage:
 *   1. Mở Chrome với remote debugging:
 *      chrome --remote-debugging-port=9222 --user-data-dir="C:\temp\chrome-debug"
 *   2. Truy cập target website, vượt qua Cloudflare challenge
 *   3. Chạy script: node crawl_webapp.js
 * 
 * Dependencies: npm install puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ============ CẤU HÌNH ============
const TARGET_URL = 'https://TARGET_DOMAIN';  // Thay bằng domain target
const OUTPUT_DIR = './crawl_results';
const JS_DIR = path.join(OUTPUT_DIR, 'js');
// ==================================

async function main() {
    // Kết nối Chrome đang chạy (đã bypass Cloudflare)
    const browser = await puppeteer.connect({
        browserURL: 'http://127.0.0.1:9222',
        defaultViewport: null
    });

    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes(new URL(TARGET_URL).hostname)) || pages[0];
    
    console.log(`[*] Connected to: ${page.url()}`);
    
    // Tạo thư mục output
    fs.mkdirSync(JS_DIR, { recursive: true });

    // Thu thập tất cả URLs trên trang
    const urls = await page.evaluate(() => {
        const links = new Set();
        // Links
        document.querySelectorAll('a[href]').forEach(a => links.add(a.href));
        // Scripts
        document.querySelectorAll('script[src]').forEach(s => links.add(s.src));
        // Stylesheets
        document.querySelectorAll('link[href]').forEach(l => links.add(l.href));
        // Images
        document.querySelectorAll('img[src]').forEach(i => links.add(i.src));
        return [...links];
    });

    console.log(`[+] Found ${urls.length} URLs`);

    // Tải JS files
    const jsUrls = urls.filter(u => u.endsWith('.js'));
    console.log(`[+] Downloading ${jsUrls.length} JS files...`);

    for (const jsUrl of jsUrls) {
        try {
            // Dùng page.evaluate(fetch()) để bypass WAF
            const content = await page.evaluate(async (url) => {
                const res = await fetch(url);
                return await res.text();
            }, jsUrl);

            const filename = path.basename(new URL(jsUrl).pathname);
            fs.writeFileSync(path.join(JS_DIR, filename), content);
            console.log(`  [✓] ${filename} (${content.length} bytes)`);
        } catch (e) {
            console.log(`  [✗] ${path.basename(jsUrl)}: ${e.message}`);
        }
    }

    // Phân tích JS files
    console.log('\n[*] Analyzing JS files...\n');
    const jsFiles = fs.readdirSync(JS_DIR);
    
    const results = {
        apiEndpoints: new Set(),
        routes: new Set(),
        secrets: [],
        authPatterns: []
    };

    for (const file of jsFiles) {
        const content = fs.readFileSync(path.join(JS_DIR, file), 'utf-8');
        
        // Tìm API endpoints
        const apiMatches = content.match(/["'`](\/api\/[^"'`\s]+)["'`]/g) || [];
        apiMatches.forEach(m => results.apiEndpoints.add(m.replace(/["'`]/g, '')));

        // Tìm routes
        const routeMatches = content.match(/["'`](\/[a-z][a-z0-9-/]+)["'`]/g) || [];
        routeMatches.forEach(m => {
            const route = m.replace(/["'`]/g, '');
            if (!route.includes('.') && route.length < 50) results.routes.add(route);
        });

        // Tìm potential secrets
        const secretPatterns = [
            /(?:api[_-]?key|apikey|secret|token|password|auth)\s*[:=]\s*["']([^"']+)["']/gi,
            /Bearer\s+[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
        ];
        for (const pattern of secretPatterns) {
            const matches = content.match(pattern) || [];
            matches.forEach(m => results.secrets.push({ file, match: m.substring(0, 100) }));
        }
    }

    // Output results
    const output = [
        '═'.repeat(60),
        '  CRAWL RESULTS',
        '═'.repeat(60),
        '',
        `[+] Pages: ${urls.filter(u => !u.match(/\.(js|css|png|jpg|svg|woff)$/)).length}`,
        `[+] JS Files: ${jsFiles.length}`,
        `[+] API Endpoints: ${results.apiEndpoints.size}`,
        '',
        '── API Endpoints ──',
        ...[...results.apiEndpoints].sort(),
        '',
        '── Potential Secrets ──',
        ...results.secrets.map(s => `  ${s.file}: ${s.match}`),
        '',
        '═'.repeat(60),
    ].join('\n');

    fs.writeFileSync(path.join(OUTPUT_DIR, 'results.txt'), output);
    console.log(output);
    console.log(`\n[+] Results saved to ${OUTPUT_DIR}/results.txt`);

    browser.disconnect();
}

main().catch(console.error);
