const http = require('http');
const qrcode = require('qrcode-terminal');

function checkEndpoint(port, path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: '127.0.0.1', port, path, timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy());
  });
}

async function findTunnel() {
  // Check ngrok API ports
  for (const port of [4040, 4041, 4042]) {
    try {
      const data = await checkEndpoint(port, '/api/tunnels');
      if (data && data.tunnels && data.tunnels.length > 0) {
        for (const t of data.tunnels) {
          const publicUrl = t.public_url;
          if (publicUrl) {
            const expUrl = publicUrl.replace(/^https?:\/\//, 'exp://');
            console.log('\n================================================================');
            console.log('  🌐 EXPO GO CROSS-NETWORK / ANY WI-FI QR CODE');
            console.log('================================================================\n');
            console.log(`🔗 Universal Tunnel URL: ${expUrl}\n`);
            console.log('📷 Scan with Expo Go (Android) or Camera (iOS) on ANY network:\n');
            qrcode.generate(expUrl, { small: true }, (qr) => {
              console.log(qr);
              console.log('================================================================\n');
            });
            return expUrl;
          }
        }
      }
    } catch {}
  }

  // If no ngrok port found, check Expo Metro status endpoint
  try {
    const metroStatus = await checkEndpoint(8081, '/status');
    console.log('Metro status:', metroStatus);
  } catch (err) {
    console.log('Metro check error:', err.message);
  }

  return null;
}

findTunnel();
