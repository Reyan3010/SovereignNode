const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

const targetUrl = 'http://www.alumcreekheating.com/';

async function auditSite() {
      console.log(`[AUDITOR] Scanning ${targetUrl} for missing tags...`);
      try {
                const response = await axios.get(targetUrl);
                const $ = cheerio.load(response.data);
                let bugs = [];
                if ($('script[type="application/ld+json"]').length === 0) bugs.push("Missing Schema Markup (JSON-LD)");
                if ($('meta[property^="og:"]').length === 0) bugs.push("Missing Open Graph Meta Tags");

          if (bugs.length > 0) {
                        console.log(`[AUDITOR] Found vulnerabilities: ${bugs.join(', ')}`);
                        await sendPitch(bugs);
                        process.exit(0);
          } else {
                        console.log(`[AUDITOR] Site is fully optimized.`);
                        process.exit(1);
          }
      } catch (error) {
                console.error(`[AUDITOR] Error scanning site: ${error.message}`);
                process.exit(1);
      }
}

async function sendPitch(bugs) {
      console.log('[CLOSER] Drafting email pitch...');
      let testAccount = await nodemailer.createTestAccount();
      let transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                auth: { user: testAccount.user, pass: testAccount.pass },
      });
      await transporter.sendMail({
                from: '"Sovereign Agent" <agent@qravix.com>',
                to: "contact@example.com",
                subject: "Urgent SEO Audit Results",
                text: `We found issues: ${bugs.join(', ')}`,
      });
      console.log("[CLOSER] Pitch sent.");
}
auditSite();
