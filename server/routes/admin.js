const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(requireAuth, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        COUNT(*)                                                                   AS total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END)                           AS active,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END)                          AS admins,
        SUM(CASE WHEN last_login >= DATEADD(day, -7, GETUTCDATE()) THEN 1 ELSE 0 END) AS recent_logins
      FROM app_users
    `);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT id, email, display_name, role, is_active, last_login, created_at, updated_at
      FROM app_users
      ORDER BY created_at DESC
    `);
    res.json({ users: result.recordset });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// POST /api/admin/users
router.post('/users', async (req, res) => {
  const { email, display_name, role } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required.' });
  if (!['admin', 'viewer'].includes(role)) return res.status(400).json({ error: 'Role must be admin or viewer.' });

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('email', sql.NVarChar, email.toLowerCase().trim())
      .input('display_name', sql.NVarChar, display_name?.trim() || null)
      .input('role', sql.NVarChar, role)
      .query(`
        INSERT INTO app_users (email, display_name, role, is_active)
        OUTPUT INSERTED.*
        VALUES (@email, @display_name, @role, 1)
      `);
    res.status(201).json({ user: result.recordset[0] });
  } catch (err) {
    if (err.number === 2627) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { display_name, role, is_active } = req.body;

  if (role !== undefined && !['admin', 'viewer'].includes(role)) {
    return res.status(400).json({ error: 'Role must be admin or viewer.' });
  }

  // Prevent removing the last admin
  if (role === 'viewer' || is_active === false || is_active === 0) {
    try {
      const pool = await getPool();
      const adminCheck = await pool
        .request()
        .input('id', sql.Int, id)
        .query(`
          SELECT COUNT(*) AS cnt FROM app_users
          WHERE role = 'admin' AND is_active = 1 AND id != @id
        `);
      if (adminCheck.recordset[0].cnt === 0) {
        return res.status(400).json({ error: 'Cannot demote or deactivate the last active admin.' });
      }
    } catch (err) {
      console.error('Admin check error:', err);
      return res.status(500).json({ error: 'Failed to validate admin count.' });
    }
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('display_name', sql.NVarChar, display_name?.trim() ?? null)
      .input('role', sql.NVarChar, role ?? null)
      .input('is_active', sql.Bit, is_active !== undefined ? (is_active ? 1 : 0) : null)
      .query(`
        UPDATE app_users
        SET
          display_name = COALESCE(@display_name, display_name),
          role         = COALESCE(@role, role),
          is_active    = COALESCE(@is_active, is_active),
          updated_at   = GETUTCDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (!result.recordset.length) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: result.recordset[0] });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }

  try {
    const pool = await getPool();

    // Prevent deleting the last admin
    const target = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT role, is_active FROM app_users WHERE id = @id');

    if (!target.recordset.length) return res.status(404).json({ error: 'User not found.' });

    if (target.recordset[0].role === 'admin') {
      const adminCount = await pool.request().query(`
        SELECT COUNT(*) AS cnt FROM app_users WHERE role = 'admin' AND is_active = 1
      `);
      if (adminCount.recordset[0].cnt <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last active admin.' });
      }
    }

    await pool.request().input('id', sql.Int, id).query('DELETE FROM app_users WHERE id = @id');
    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

module.exports = router;
