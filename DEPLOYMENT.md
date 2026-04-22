# Deployment Guide — Gemba Api Center
**Server**: Ubuntu 24.04 LTS | **Domain**: `apiexplorer.accrualequitypartners.com` | **App dir**: `/root/apiexplorer_frontend`

---

## Prerequisites (already on your VM)
- Node.js + npm
- PM2
- Nginx
- Git

---

## Step 1 — Clone the Repository

```bash
cd /root
git clone https://github.com/YOUR_ORG/YOUR_REPO.git apiexplorer_frontend
cd /root/apiexplorer_frontend
```

> Replace the GitHub URL with your actual repository URL.

---

## Step 2 — Create the Production `.env` File

```bash
nano /root/apiexplorer_frontend/.env
```

Paste the following:

```env
DB_SERVER=gembadbsvr.database.windows.net
DB_USERNAME=gembadbuser
DB_PASSWORD=XiLNiFV2iWLEREFTXgam
DB_DATABASE=gemba
PORT=3001

# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=REPLACE_WITH_A_STRONG_RANDOM_SECRET

NODE_ENV=production

APP_URL=https://apiexplorer.accrualequitypartners.com
FRONTEND_ORIGIN=https://apiexplorer.accrualequitypartners.com
AI_CENTER_URL=https://aicenterback.accrualequitypartners.com
```

Save: `Ctrl+X` then `Y` then `Enter`

Generate JWT_SECRET (run on server, copy output into .env):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 3 — Install Dependencies

```bash
cd /root/apiexplorer_frontend
npm install --production
npm install --prefix admin
```

---

## Step 4 — Build the Admin Panel

```bash
cd /root/apiexplorer_frontend
npm run build
```

Verify:
```bash
ls admin/dist/
# Should show: index.html  assets/
```

---

## Step 5 — Configure PM2

```bash
nano /root/apiexplorer_frontend/ecosystem.config.js
```

Paste:

```js
module.exports = {
  apps: [
    {
      name: 'apiexplorer',
      script: 'server/index.js',
      cwd: '/root/apiexplorer_frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

Start with PM2:

```bash
cd /root/apiexplorer_frontend
pm2 start ecosystem.config.js
pm2 save
```

Verify:
```bash
pm2 status
pm2 logs apiexplorer --lines 30
```

---

## Step 6 — Configure Nginx

```bash
nano /etc/nginx/sites-available/apiexplorer
```

Paste:

```nginx
server {
    listen 80;
    server_name apiexplorer.accrualequitypartners.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name apiexplorer.accrualequitypartners.com;

    ssl_certificate     /etc/letsencrypt/live/apiexplorer.accrualequitypartners.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/apiexplorer.accrualequitypartners.com/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    location / {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/apiexplorer /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## Step 7 — Point DNS to Your VM

In your DNS provider, add an A record:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `apiexplorer` | `YOUR_VM_PUBLIC_IP` | 300 |

Get your VM public IP:
```bash
curl -s ifconfig.me
```

Check DNS is live:
```bash
nslookup apiexplorer.accrualequitypartners.com
```

---

## Step 8 — SSL Certificate (Let's Encrypt)

```bash
# Install Certbot if not already installed
apt install certbot python3-certbot-nginx -y

# Issue certificate
certbot --nginx -d apiexplorer.accrualequitypartners.com

# Test auto-renewal
certbot renew --dry-run
```

---

## Step 9 — Verify

```bash
pm2 status
pm2 logs apiexplorer --lines 50
curl -I https://apiexplorer.accrualequitypartners.com/
```

Open in browser:
- Explorer: `https://apiexplorer.accrualequitypartners.com/`
- Admin: `https://apiexplorer.accrualequitypartners.com/admin`

---

## Step 10 — Future Updates

```bash
cd /root/apiexplorer_frontend
git pull origin main
npm install --production
npm install --prefix admin
npm run build
pm2 restart apiexplorer
```

---

## PM2 Commands

```bash
pm2 status                   # show all apps
pm2 logs apiexplorer         # live logs
pm2 restart apiexplorer      # restart
pm2 reload apiexplorer       # zero-downtime reload
pm2 stop apiexplorer         # stop
```

---

## Troubleshooting

**App not starting:**
```bash
pm2 logs apiexplorer --lines 100
```

**Nginx 502 Bad Gateway:**
```bash
curl http://127.0.0.1:3001/
pm2 status
```

**DB connection failed:**
- Add your VM public IP to Azure SQL firewall:
  - portal.azure.com → `gembadbsvr` → Networking → Firewall rules → Add your IP

**SSO not working after deploy:**
- Make sure `APP_URL=https://apiexplorer.accrualequitypartners.com` in `.env`
- Ask AI Center team to whitelist: `https://apiexplorer.accrualequitypartners.com/api/auth/ai-center`
