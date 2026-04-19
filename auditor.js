const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

const GMAIL_USER = 'mrreyan05@gmail.com';
const GMAIL_APP_PASS = 'kzvkpcxnewtfqqpk';

const targets = [
    { url: 'http://denverdentalarts.com', contact: 'info@denverdentalarts.com' },
    { url: 'https://ttmmechanical.com', contact: 'info@ttmmechanical.com' },
    { url: 'https://delawareairandheat.com', contact: 'info@delawareairandheat.com' },
    { url: 'https://randsmechanical.org', contact: 'info@randsmechanical.org' },
];
const target = targets[Math.floor(Math.random() * targets.length)];

async function auditSite() {
    console.log('[AUDITOR] Scanning ' + target.url);
    try {
        const response = await axios.get(target.url, { timeout: 10000 });
        const $ = cheerio.load(response.data);
        let bugs = [];
        if ($('script[type="application/ld+json"]').length === 0) bugs.push('Missing Schema Markup');
        if ($('meta[property^="og:"]').length === 0) bugs.push('Missing Open Graph Tags');
        if (bugs.length > 0) { await sendPitch(bugs); process.exit(0); }
        else { process.exit(1); }
    } catch (e) { console.error(e.message); process.exit(1); }
}

async function sendPitch(bugs) {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASS } });
    await transporter.sendMail({
        from: 'Qravix SEO Audit <' + GMAIL_USER + '>',
        to: target.contact,
        subject: 'SEO Issues Found on Your Website',
        text: 'Hello,\n\nWe found these issues on your site:\n\n- ' + bugs.join('\n- ') + '\n\nWe can fix all of these for $20. Reply to get started.\n\nQravix Team'
    });
    console.log('[CLOSER] Email sent to ' + target.contact);
}

auditSite();
