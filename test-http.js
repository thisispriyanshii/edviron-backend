const https = require('https');

console.log('Testing network connectivity...');

const options = {
  hostname: 'www.google.com',
  port: 443,
  path: '/',
  method: 'GET',
  timeout: 10000
};

const req = https.request(options, (res) => {
  console.log(`✅ Successfully connected to ${options.hostname}`);
  console.log('Status Code:', res.statusCode);
  res.on('data', () => {});
});

req.on('error', (error) => {
  console.error('❌ Connection failed!');
  console.error('Error:', error.message);
});

req.on('timeout', () => {
  console.error('❌ Connection timed out!');
  req.destroy();
});

req.end();
