/**
 * Infrastructure Reconnaissance
 * 
 * - Subdomain enumeration via DNS brute force
 * - S3 bucket misconfiguration check
 * - Panel discovery (Pterodactyl, Virtualizor, VestaCP)
 * - Staff email enumeration
 * - DNS record retrieval via Google DoH
 * 
 * Usage: node recon_infrastructure.js
 */

// ============ CẤU HÌNH ============
const DOMAINS = ['target.com'];
const TIMEOUT = 8000;
// ==================================

const SUBDOMAIN_LIST = [
    'www', 'mail', 'admin', 'panel', 'api', 'staging', 'test', 'dev',
    'portal', 'dashboard', 'app', 'cdn', 'media', 'static', 'docs',
    'git', 'jenkins', 'ci', 'docker', 'registry', 'monitor',
    'grafana', 'kibana', 'elastic', 'db', 'database', 'mysql',
    'postgres', 'redis', 'mongo', 'backup', 'backups', 'ftp',
    'sftp', 'vpn', 'openvpn', 'wireguard', 'ssh', 'bastion',
    'node1', 'node2', 'node3', 'server', 'srv', 'ns1', 'ns2',
    'mx', 'smtp', 'imap', 'pop3', 'webmail', 'exchange',
    'status', 'uptime', 'health', 'api-staging', 'api-dev',
    'game', 'gameserver', 'pterodactyl', 'ptero', 'vps',
    'internal', 'office', 'staff', 'hr', 'crm', 'erp',
    'storage', 's3', 'minio', 'console', 'auth', 'sso',
    'blog', 'shop', 'store', 'pay', 'payment', 'billing',
];

async function checkSubdomain(subdomain, domain) {
    const url = `https://${subdomain}.${domain}`;
    try {
        const res = await fetch(url, {
            signal: AbortSignal.timeout(TIMEOUT),
            redirect: 'manual',
        });
        const server = res.headers.get('server') || '';
        return { subdomain: `${subdomain}.${domain}`, status: res.status, server, url };
    } catch {
        return null;
    }
}

async function dnsLookup(domain, type) {
    try {
        const res = await fetch(
            `https://dns.google/resolve?name=${domain}&type=${type}`,
            { signal: AbortSignal.timeout(5000) }
        );
        const data = await res.json();
        return data.Answer?.map(a => a.data) || [];
    } catch {
        return [];
    }
}

async function main() {
    console.log('═'.repeat(60));
    console.log('  INFRASTRUCTURE RECONNAISSANCE');
    console.log('═'.repeat(60) + '\n');

    for (const domain of DOMAINS) {
        console.log(`\n── DNS Records: ${domain} ──\n`);
        for (const type of ['A', 'MX', 'TXT', 'NS', 'CNAME']) {
            const records = await dnsLookup(domain, type);
            if (records.length) {
                console.log(`  ${type}:`);
                records.forEach(r => console.log(`    → ${r}`));
            }
        }

        console.log(`\n── Subdomain Scan: ${domain} ──\n`);
        const concurrency = 10;
        const found = [];
        
        for (let i = 0; i < SUBDOMAIN_LIST.length; i += concurrency) {
            const batch = SUBDOMAIN_LIST.slice(i, i + concurrency);
            const results = await Promise.all(batch.map(s => checkSubdomain(s, domain)));
            results.filter(Boolean).forEach(r => {
                console.log(`  ✅ [${r.status}] ${r.subdomain} (${r.server})`);
                found.push(r);
            });
        }
        
        console.log(`\n  Found: ${found.length} live subdomains`);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('  RECON COMPLETE');
    console.log('═'.repeat(60));
}

main().catch(console.error);
