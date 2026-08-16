const qrcode = require('qrcode-terminal');
const os = require('os');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const customUrl = process.argv[2];
const ip = getLocalIp();
const expUrl = customUrl || `exp://${ip}:8081`;

console.log('\n================================================================');
console.log('  🍔 MYQURO RESTAURANT - EXPO GO QR CODE GENERATOR');
console.log('================================================================\n');

if (customUrl) {
  console.log(`🌐 Cross-Network / Tunnel Mode Enabled:`);
  console.log(`🔗 Target URL: ${expUrl}\n`);
} else {
  console.log(`📶 Local LAN URL (Same Wi-Fi Network):`);
  console.log(`🔗 ${expUrl}`);
  console.log(`\n💡 To generate for a different network / mobile data:`);
  console.log(`   Run with your Tunnel / Ngrok URL:`);
  console.log(`   npm run qr -- exp://<your-ngrok-url>.ngrok.app`);
  console.log(`   Or run: npx expo start --tunnel\n`);
}

console.log('📷 Scan QR Code below in Expo Go (Android) or Camera App (iOS):\n');

qrcode.generate(expUrl, { small: true }, (qr) => {
  console.log(qr);
  console.log('================================================================\n');
});
