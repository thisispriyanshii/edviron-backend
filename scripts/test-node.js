console.log('Node.js is working!');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Current directory:', process.cwd());

// Test basic functionality
try {
  const fs = require('fs');
  console.log('File system module loaded successfully');
  
  // List files in current directory
  const files = fs.readdirSync('.');
  console.log('Files in current directory:', files);
  
} catch (error) {
  console.error('Error testing file system:', error.message);
}
