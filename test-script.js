console.log('Node.js is working!');
console.log('Current directory:', process.cwd());

// Test file system access
const fs = require('fs');
const files = fs.readdirSync('.');
console.log('Files in current directory:', files);
