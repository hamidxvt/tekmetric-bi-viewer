require('dotenv').config();
const { getPool, initDB, sql } = require('../server/db');

async function seedUser() {
  await initDB(); // creates app_users if not exists

  const pool = await getPool();

  const email = 'arslan.thaheem@xvantech.com';
  const name  = 'Arslan Thaheem';
  const role  = 'admin';

  const result = await pool
    .request()
    .input('email', sql.NVarChar, email)
    .input('name',  sql.NVarChar, name)
    .input('role',  sql.NVarChar, role)
    .query(`
      IF EXISTS (SELECT 1 FROM app_users WHERE email = @email)
        UPDATE app_users
        SET display_name = @name, role = @role, is_active = 1, updated_at = GETUTCDATE()
        OUTPUT INSERTED.id, INSERTED.email, INSERTED.display_name, INSERTED.role, INSERTED.is_active
        WHERE email = @email
      ELSE
        INSERT INTO app_users (email, display_name, role, is_active)
        OUTPUT INSERTED.id, INSERTED.email, INSERTED.display_name, INSERTED.role, INSERTED.is_active
        VALUES (@email, @name, @role, 1)
    `);

  const user = result.recordset[0];
  console.log('\n✅ User seeded successfully:\n');
  console.table([{
    id:     user.id,
    email:  user.email,
    name:   user.display_name,
    role:   user.role,
    active: user.is_active ? 'yes' : 'no',
  }]);
  process.exit(0);
}

seedUser().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
