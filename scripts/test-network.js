const https = require('https');

console.log('Testing network connectivity to MongoDB Atlas...');

// Test DNS resolution and TCP connection
const options = {
  hostname: 'edviron-cluster.achi4be.mongodb.net',
  port: 443,
  path: '/',
  method: 'HEAD',
  timeout: 10000, // 10 seconds
};

const req = https.request(options, (res) => {
  console.log(`✅ Successfully connected to ${options.hostname}`);
  console.log('Status Code:', res.statusCode);
  res.on('data', () => {}); // Consume response data
});

req.on('error', (error) => {
  console.error('❌ Connection failed!');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  if (error.code) console.error('Error code:', error.code);
  if (error.syscall) console.error('System call:', error.syscall);
});

req.on('timeout', () => {
  console.error('❌ Connection timed out!');
  req.destroy();
});

req.end();
