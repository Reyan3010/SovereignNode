const { exec } = require('child_process');
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Sovereign OS | Command Center | Online\n');
});

server.listen(PORT, () => {
  console.log(`[MASTER] Server running on port ${PORT}`);
    console.log('[MASTER] Initializing autonomous hunt cycle...');

                // Run the first audit
                runAudit();

                // Run every 60 seconds (High-Intensity Mode)
                setInterval(runAudit, 60000);
});

function runAudit() {
    console.log('[MASTER] Triggering audit cycle...');
    exec('node auditor.js', (error, stdout, stderr) => {
          if (error) {
                  console.error(`[MASTER] Audit error: ${error.message}`);
                  return;
          }
          if (stderr) {
                  console.error(`[MASTER] Audit stderr: ${stderr}`);
                  return;
          }
          console.log(`[MASTER] Audit results: ${stdout}`);
    });
}
