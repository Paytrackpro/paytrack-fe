## PayTrack Frontend

A Single-Page Application (SPA) for the PayTrack system, built with Vue 3 and the Quasar Framework. The project provides a modern, secure, real-time interface for cryptocurrency payment management, time tracking, reporting, and user settings.

### Project Purpose

- Manage the full payment lifecycle: create request → approve → pay → complete
- Support multiple coins and blockchain networks (BTC, LTC, DCR, ETH, USDT, ...)
- Generate invoices and Payment URLs for external partners
- Track working time (timer), user reports, and system reports
- Multi-layer security: JWT, OTP/TOTP, Passkey/WebAuthn, role-based access control
- Real-time updates via WebSocket

---

## Technology & Architecture

- Vue.js 3, Quasar 2 (UI), Vue Router 4, Vuex 4
- Axios (HTTP, `BASE_URL` from environment), Socket.IO client (real-time)
- i18n (multi-language), SCSS, ESLint + Prettier
- SPA using router mode `history`, build output at `dist/spa`

Key configuration:
- Dev server: runs at `http://localhost:8081` (configured in `quasar.config.js`)
- Build-time env: loaded from `.env` via `dotenv` in `quasar.config.js`
- Axios uses `process.env.BASE_URL` and automatically attaches `Authorization: Bearer <token>` and `Logintype` from `localStorage`

---

## System Requirements

- Node.js 18 LTS (recommended; Docker build uses `node:18-alpine`)
- Yarn 1.x
- Docker & Docker Compose (if deploying with containers)
- macOS/Linux/Windows supported

---

## Quick Start (Local Development)

### 1) Clone the repository

```bash
git clone <repo-url>
cd paytrack-fe
```

### 2) Configure environment

Create a `.env` file at the project root:

```env
BASE_URL=http://localhost:6789/api
```

Tips:
- You can create `.env.production` for production builds/deployments
- `BASE_URL` must point to a valid backend API (use HTTPS in production)

### 3) Install dependencies

```bash
yarn install
```

### 4) Run the dev server

```bash
yarn dev
```

The app will open at: `http://localhost:8081`

### 5) Code quality checks

```bash
# Lint
yarn lint

# Format + fix lint
yarn format
```

---

## Production Build

```bash
# SPA production build
yarn build

# PWA (optional)
yarn build:pwa
```

Build output is located at: `dist/spa`

Note: `BASE_URL` is embedded at build time from `.env`. To change the endpoint after a build, update `.env` and rebuild.

---

## Production Deployment

### Option A: Docker Compose (recommended, fast)

1) Prepare a `.env` (next to `docker-compose.yml`):

```env
BASE_URL=https://your-domain/api
```

2) Use the provided script:

```bash
# Start container
docker compose up -d

# View logs
docker compose logs -f
```

Key Compose settings:
- Service: `paytrack-frontend`
- Port mapping: `80:80`
- Mount Nginx config: `./nginx.conf -> /etc/nginx/conf.d/default.conf`
- Healthcheck: HTTP to `http://localhost:80/`

Useful commands:
```bash
docker compose ps
docker exec -it paytrack-frontend sh
docker exec paytrack-frontend cat /var/log/nginx/error.log
```

The app will be available at: `http://localhost:80`

#### SSL + custom domain (Docker Compose)

To serve the SPA over HTTPS with your own domain (e.g., `pay.your-domain.com`), do the following:

1) Prepare TLS certificates on the host (recommended: Let's Encrypt via Certbot on the host). Typical paths:

```text
/etc/letsencrypt/live/your-domain.com/fullchain.pem
/etc/letsencrypt/live/your-domain.com/privkey.pem
```

2) Expose port 443 and mount the certs into the container. Update `docker-compose.yml`:

```yaml
services:
  paytrack-frontend:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

3) Edit `nginx.conf` to add your domain and SSL. Replace `your-domain.com` with your real domain (A/AAAA DNS records should point to your server):

```nginx
# HTTP: keep /health for Docker healthcheck, redirect everything else to HTTPS
server {
    listen 80;
    server_name your-domain.com;

    # Health check endpoint (stay on HTTP 80)
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Redirect all other requests to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS: serve the SPA securely
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    root /usr/share/nginx/html;
    index index.html;

    # TLS certs mounted from host
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    # Error logging
    error_log /var/log/nginx/error.log warn;
    access_log /var/log/nginx/access.log;

    # Gzip compression
    gzip on;
    gzip_static on;
    gzip_types text/plain text/css text/javascript application/javascript application/json application/x-javascript text/xml application/xml application/xml+rss;
    gzip_proxied any;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: http: data: blob: 'unsafe-inline' 'unsafe-eval'" always;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;

        # Optional debug headers
        add_header X-Debug-Root $document_root always;
        add_header X-Debug-URI $uri always;
    }

    # Error pages
    error_page 404 /index.html;
}
```

4) Restart the service:

```bash
docker compose up -d --force-recreate
```

Verify:
- Open `https://your-domain.com`
- Check logs if needed: `docker compose logs -f`
- Inside the container: `docker exec -it paytrack-frontend sh` and inspect `/var/log/nginx/error.log`

Notes:
- If you prefer to terminate TLS at a reverse proxy (e.g., Traefik/Caddy/Nginx on the host) and keep this container HTTP-only, you can skip the SSL steps here and just forward traffic to port 80 of the container.
- Ensure your backend API (`BASE_URL`) is also HTTPS in production.

### Option B: Static Nginx (no Docker)

1) Build production: `yarn build`

2) Copy output to your web server:

```bash
scp -r dist/spa/* user@server:/var/www/your-domain/html/
```

3) Minimal Nginx config (SPA fallback):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/your-domain/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Security/performance tips: enable gzip, add security headers, cache static assets… (see `nginx.conf` in this repo for a fuller example).

### Option C: Static hosting (CDN)

You can deploy the contents of `dist/spa` to static hosting platforms such as S3 + CloudFront, Netlify, Vercel… Make sure to enable SPA fallback to `index.html`.

---

## Key Configuration & Security

- Auth: The frontend sends `Authorization: Bearer <token>` and `Logintype` (from `localStorage`) via an Axios interceptor
- 401: Automatically clears `token`/`user` and reloads the page
- Use HTTPS in production for both frontend and API
- CORS: ensure the API allows requests from your frontend domain


## Notes

- This is an SPA and can be served via a CDN. Since `BASE_URL` is embedded at build time, you must rebuild if you want to change the API endpoint.


