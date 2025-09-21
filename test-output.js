const fs = require('fs');

// Write to a file instead of console
fs.writeFileSync('test-output.txt', 'Node.js is working!\n');
fs.appendFileSync('test-output.txt', `Current directory: ${process.cwd()}\n`);

// List files
const files = fs.readdirSync('.');
fs.appendFileSync('test-output.txt', 'Files in directory:\n' + files.join('\n'));
