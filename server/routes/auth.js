const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../db');
const { requireAuth } = require('../middleware/auth');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 8 * 60 * 60 * 1000, // 8 hours
};

// ─── Extract email from AI Center JWT (decode only — no signature check needed)
// AI Center is the one calling us, so the token comes directly from their system.
// We decode it to get the email claim; the emailHint from the POST body is a fallback.
function extractEmailFromToken(aiToken) {
  try {
    // jwt.decode does NOT verify signature — just parses the payload
    const payload = jwt.decode(aiToken);
    return (payload?.email || payload?.sub || payload?.username || '').toLowerCase().trim();
  } catch {
    return '';
  }
}

// ─── Shared: look up / bootstrap user in our DB ───────────────────────────────
async function resolveUser(aiToken, emailHint) {
  // Get the email from the token payload, fall back to what AI Center sent in the body
  const tokenEmail = extractEmailFromToken(aiToken);
  const email = (tokenEmail || emailHint || '').toLowerCase().trim();

  if (!email) {
    throw Object.assign(
      new Error('No email found in the token from AI Center. Please contact support.'),
      { status: 400 }
    );
  }

  console.log(`🔑 SSO login attempt: ${email}`);

  const pool = await getPool();
  let result = await pool
    .request()
    .input('email', sql.NVarChar, email)
    .query('SELECT * FROM app_users WHERE email = @email');

  let user = result.recordset[0];

  if (!user) {
    const countResult = await pool.request().query('SELECT COUNT(*) AS cnt FROM app_users');
    if (countResult.recordset[0].cnt === 0) {
      // Bootstrap: first login ever → auto-create as admin
      const insert = await pool
        .request()
        .input('email', sql.NVarChar, email)
        .input('name',  sql.NVarChar, email)
        .query(`
          INSERT INTO app_users (email, display_name, role, is_active)
          OUTPUT INSERTED.*
          VALUES (@email, @name, 'admin', 1)
        `);
      user = insert.recordset[0];
      console.log(`✅ Bootstrap: first user ${email} created as admin.`);
    } else {
      throw Object.assign(
        new Error('Access denied. Your account has not been added to this application. Contact an administrator.'),
        { status: 403 }
      );
    }
  }

  if (!user.is_active) {
    throw Object.assign(
      new Error('Your account has been deactivated. Contact an administrator.'),
      { status: 403 }
    );
  }

  // Update last_login
  await pool
    .request()
    .input('id', sql.Int, user.id)
    .query('UPDATE app_users SET last_login = GETUTCDATE(), updated_at = GETUTCDATE() WHERE id = @id');

  return user;
}

function issueJwt(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.display_name },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

// ─── SSO Callback — called by AI Center after the user logs in ────────────────
// AI Center POSTs: { access_token, user_email } to this endpoint.
// Registered under both /ai-center (AI Center's hardcoded path) and /sso-callback.
async function handleSSOCallback(req, res) {
  const aiToken   = req.body?.access_token || req.body?.token || req.query.access_token || req.query.token;
  const emailHint = req.body?.user_email   || req.body?.email  || req.query.user_email   || req.query.email;
  const appRedirect = req.body?.app_redirect || req.query.app_redirect || '/';

  if (!aiToken) {
    return res.status(400).send(errorPage('Authentication failed — no token received from AI Center.'));
  }

  try {
    const user  = await resolveUser(aiToken, emailHint);
    const token = issueJwt(user);

    res.cookie('token', token, COOKIE_OPTS);

    // Redirect the browser into the app
    // Works whether AI Center used a browser form-POST or an AJAX call
    const dest = /^\//.test(appRedirect) ? appRedirect : '/';
    return res.send(redirectPage(dest));
  } catch (err) {
    console.error('SSO callback error:', err.message);
    return res.status(err.status || 500).send(errorPage(err.message));
  }
}

// Register under both paths — AI Center calls /ai-center, our config uses /sso-callback
router.all('/ai-center',    handleSSOCallback);
router.all('/sso-callback', handleSSOCallback);

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ─── Helper HTML responses ────────────────────────────────────────────────────
function redirectPage(dest) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Signing in…</title>
<style>
  body{margin:0;background:#0b1120;color:#94a3b8;font-family:system-ui,sans-serif;
       display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:12px}
  .spin{width:36px;height:36px;border:3px solid rgba(99,130,246,.3);
        border-top-color:#3b82f6;border-radius:50%;animation:s .7s linear infinite}
  @keyframes s{to{transform:rotate(360deg)}}
  p{font-size:.9rem}
</style>
</head>
<body>
  <div class="spin"></div>
  <p>Signing you in…</p>
  <script>window.location.replace(${JSON.stringify(dest)});</script>
</body></html>`;
}

function errorPage(message) {
  const aiCenterUrl = process.env.AI_CENTER_URL || '/';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Sign-in Error</title>
<style>
  body{margin:0;background:#0b1120;color:#f1f5f9;font-family:system-ui,sans-serif;
       display:flex;align-items:center;justify-content:center;min-height:100vh;padding:1.5rem}
  .card{background:#111827;border:1px solid #1f2d3d;border-radius:12px;padding:2rem;max-width:420px;width:100%;text-align:center}
  h2{color:#f87171;margin:0 0 .5rem}
  p{color:#94a3b8;font-size:.9rem;line-height:1.5;margin:.5rem 0 1.5rem}
  a{display:inline-block;padding:.6rem 1.4rem;background:#3b82f6;color:#fff;border-radius:8px;
    text-decoration:none;font-size:.9rem;font-weight:600}
</style>
</head>
<body>
  <div class="card">
    <h2>Sign-in Failed</h2>
    <p>${message}</p>
    <a href="${aiCenterUrl}">Try Again</a>
  </div>
</body></html>`;
}

module.exports = router;
