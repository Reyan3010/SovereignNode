const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const nodemailer = require('nodemailer');

const WALLET_FILE = path.join(__dirname, 'wallet.json');
const LOG_FILE = path.join(__dirname, 'activity.log');
const NOTIFY_EMAIL = 'mrreyan05@Gmail.com';

function logActivity(msg) {
    const time = new Date().toLocaleTimeString();
    const entry = `[${time}] ${msg}`;
    console.log(entry);
    try { fs.appendFileSync(LOG_FILE, entry + '\n'); } catch(e) {}
}

function readWallet() {
    try { return JSON.parse(fs.readFileSync(WALLET_FILE, 'utf8')); }
    catch (e) { return { Last_Earning_Date: new Date().toISOString().split('T')[0], Total_Revenue: 0, Agent_Operating_Fund: 0, User_Profit: 0 }; }
}

function writeWallet(wallet) {
    fs.writeFileSync(WALLET_FILE, JSON.stringify(wallet, null, 2));
}

async function sendUserNotification(amount, profit) {
    logActivity(`[NOTIFIER] Sending report to ${NOTIFY_EMAIL}...`);
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({ host: "smtp.ethereal.email", port: 587, auth: { user: testAccount.user, pass: testAccount.pass } });
    await transporter.sendMail({ from: '"Sovereign Engine" <agent@qravix.com>', to: NOTIFY_EMAIL, subject: "💰 New Revenue Detected!", text: `Deal: $${amount} | Your Profit: $${profit.toFixed(2)}` });
    logActivity(`[NOTIFIER] Report sent.`);
}

async function addRevenue(amount) {
    const wallet = readWallet();
    const profit = amount * 0.70;
    wallet.Total_Revenue += amount;
    wallet.Agent_Operating_Fund += (amount * 0.30);
    wallet.User_Profit += profit;
    wallet.Last_Earning_Date = new Date().toISOString().split('T')[0];
    writeWallet(wallet);
    logActivity(`Earned $${amount}. Your profit: $${wallet.User_Profit.toFixed(2)}`);
    await sendUserNotification(amount, profit);
}

function runCycle() {
    logActivity('Starting hunt cycle...');
    const auditor = spawn('node', ['auditor.js'], { cwd: __dirname, stdio: 'inherit' });
    auditor.on('close', (code) => {
        if (code === 0) { logActivity('Deal closed!'); addRevenue(20); }
        else { logActivity('No targets this cycle.'); }
    });
}

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(path.join(__dirname, 'dashboard.html')));
    } else if (req.url === '/api/data') {
        const wallet = readWallet();
        let logs = [];
        try { logs = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(l => l); } catch(e) {}
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ wallet, logs }));
    } else { res.writeHead(404); res.end(); }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { logActivity(`Dashboard live on port ${PORT}`); });
runCycle();
setInterval(runCycle, 600000);
