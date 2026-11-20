const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER || 'gfa_admin',
  password: process.env.DB_PASSWORD || 'GfaSecret2026*!',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'HotelGranFiestaAmericanaDB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 15,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log(`Conectado exitosamente a SQL Server (${dbConfig.database}) como [${dbConfig.user}]`);
    return pool;
  })
  .catch(err => {
    console.error('Error de conexión con SQL Server:', err.message);
    throw err;
  });

module.exports = { sql, poolPromise };