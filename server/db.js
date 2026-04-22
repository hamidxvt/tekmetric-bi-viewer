const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

async function initDB() {
  const pool = await getPool();

  // Use our own dedicated table (app_users) — separate from any pre-existing 'users' table
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='app_users' AND xtype='U')
    CREATE TABLE app_users (
      id           INT IDENTITY(1,1) PRIMARY KEY,
      email        NVARCHAR(255)  NOT NULL UNIQUE,
      display_name NVARCHAR(255),
      role         NVARCHAR(50)   NOT NULL DEFAULT 'viewer',
      is_active    BIT            NOT NULL DEFAULT 1,
      last_login   DATETIME2,
      created_at   DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
      updated_at   DATETIME2      NOT NULL DEFAULT GETUTCDATE()
    )
  `);

  console.log('✅ Database initialized');
}

module.exports = { getPool, initDB, sql };
