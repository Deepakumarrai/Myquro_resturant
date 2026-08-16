const { spawn, execSync } = require('child_process');
const qrcode = require('qrcode-terminal');

async function main() {
  const PORT = 8081;

  // Free port 8081 if occupied
  try {
    if (process.platform === 'win32') {
      execSync(`powershell -Command "Get-NetTCPConnection -LocalPort ${PORT} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"`);
    }
  } catch (e) {}

  console.log('☁️  Starting Cloudflare Public Tunnel for Cross-Network / Cellular Connectivity...');

  // Pass --http-host-header localhost:8081 to bypass Metro host checks
  const cfProcess = spawn('npx.cmd', ['-y', 'cloudflared', 'tunnel', '--url', `http://localhost:${PORT}`, '--http-host-header', `localhost:${PORT}`], {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let tunnelUrl = null;
  let hostname = null;

  const handleData = (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && !tunnelUrl) {
      tunnelUrl = match[0];
      hostname = tunnelUrl.replace(/^https?:\/\//, '');
      onTunnelReady(tunnelUrl, hostname);
    }
  };

  cfProcess.stdout.on('data', handleData);
  cfProcess.stderr.on('data', handleData);

  function onTunnelReady(url, host) {
    const expUrl = `exp://${host}`;

    console.log(`\n✅ Public Tunnel Active: ${url}`);
    console.log(`🚀 Starting Metro bundler with Cloudflare manifest origin...\n`);

    // Override manifest environment variables so Metro bundleUrl uses Cloudflare URL instead of Local IP
    const expoEnv = {
      ...process.env,
      REACT_NATIVE_PACKAGER_HOSTNAME: host,
      EXPO_DEV_SERVER_ORIGIN: url,
      EXPO_PACKAGER_PROXY_URL: url,
      EXPO_PUBLIC_TUNNEL_URL: url,
    };

    const expoProcess = spawn('npx.cmd', ['expo', 'start', '--go', '--port', `${PORT}`], {
      stdio: 'inherit',
      shell: true,
      env: expoEnv,
    });

    console.log('\n================================================================');
    console.log('  🍔 MYQURO RESTAURANT CROSS-NETWORK EXPO GO TUNNEL READY!');
    console.log('================================================================\n');
    console.log('🔗 Expo Go Public Tunnel Link (Works on Cellular / Any Wi-Fi):');
    console.log(`   ${expUrl}\n`);
    console.log('🌐 Web Preview URL:');
    console.log(`   ${url}\n`);
    console.log('📷 Scan QR Code below using Expo Go (Android) or Camera (iOS):\n');

    qrcode.generate(expUrl, { small: true }, (qr) => {
      console.log(qr);
      console.log('\n================================================================\n');
    });

    process.on('SIGINT', () => {
      cfProcess.kill();
      expoProcess.kill();
      process.exit(0);
    });
  }
}

main();
