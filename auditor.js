const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

const targets = [
    'http://denverdentalarts.com',
    'https://ttmmechanical.com',
    'https://delawareairandheat.com',
    'https://randsmechanical.org'
];
const targetUrl = targets[Math.floor(Math.random() * targets.length)];

async function auditSite() {
    console.log(`[AUDITOR] Scanning ${targetUrl}...`);
    try {
        const response = await axios.get(targetUrl, { timeout: 10000 });
        const $ = cheerio.load(response.data);
        let bugs = [];
        if ($('script[type="application/ld+json"]').length === 0) bugs.push("Missing Schema Markup");
        if ($('meta[property^="og:"]').length === 0) bugs.push("Missing Open Graph Tags");
        if (bugs.length > 0) { console.log(`[AUDITOR] Found: ${bugs.join(', ')}`); await sendPitch(bugs); process.exit(0); }
        else { console.log(`[AUDITOR] Site clean.`); process.exit(1); }
    } catch (error) { console.error(`[AUDITOR] Error: ${error.message}`); process.exit(1); }
}

async function sendPitch(bugs) {
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({ host: "smtp.ethereal.email", port: 587, auth: { user: testAccount.user, pass: testAccount.pass } });
    await transporter.sendMail({ from: '"Sovereign Agent" <agent@qravix.com>', to: "contact@example.com", subject: "SEO Issues Found On Your Site", text: `We found: ${bugs.join(', ')}. We can fix this for $20.` });
    console.log("[CLOSER] Pitch sent.");
}

auditSite();

}
auditSite();
