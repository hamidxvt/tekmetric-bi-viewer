require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  options: { encrypt: true, trustServerCertificate: false, enableArithAbort: true },
};

async function inspect() {
  const pool = await sql.connect(config);

  const cols = await pool.request().query(`
    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'users'
    ORDER BY ORDINAL_POSITION
  `);

  console.log('\n📋 Existing "users" table schema:\n');
  console.table(cols.recordset);

  const rows = await pool.request().query('SELECT TOP 5 * FROM users');
  console.log('\n📊 Existing rows (top 5):\n');
  console.table(rows.recordset);

  process.exit(0);
}

inspect().catch(err => { console.error('Error:', err.message); process.exit(1); });
