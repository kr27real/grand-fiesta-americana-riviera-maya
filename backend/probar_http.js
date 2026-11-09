const http = require('http');

http.get('http://localhost:5000/api/eventos/espacios', (res) => {
  let raw = '';
  res.on('data', chunk => raw += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', res.headers);
    console.log('BODY:', raw);
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Error HTTP:', err.message);
  process.exit(1);
});
