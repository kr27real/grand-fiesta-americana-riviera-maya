const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || process.env.DB_NAME || 'HotelGranFiestaAmericanaDB',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log(`Conectado exitosamente a SQL Server: ${config.database}`);
        return pool;
    })
    .catch(err => {
        console.error('Error crítico al conectar a SQL Server:', err.message);
        process.exit(1);
    });

module.exports = {
    sql,
    poolPromise
};