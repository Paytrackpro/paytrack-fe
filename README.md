# 🚀 MGMT Frontend (Quasar Framework)

> Frontend application for the MGMT system, built with Quasar Framework and Vue.js.

---

## 📘 Application Scope

See full documentation in the [Project Wiki](https://code.cryptopower.dev/mgmt-ng/fe/-/wikis/home)

---

## 🛠 Getting Started

### 1. Clone the Repository

```bash
git clone https://code.cryptopower.dev/mgmt-ng/fe.git
cd fe
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
BASE_URL=https://your-api-server.com
```

You can use `.env.example` as a template.

---

### 3. Install Dependencies

```bash
npm install
# or
yarn install
```

---

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

The app will be available at: [http://localhost:9000](http://localhost:9000)

---

### 5. Linting & Formatting

- **Lint code:**

  ```bash
  npm run lint
  ```

- **Auto format code:**

  ```bash
  npm run format
  ```

---

## 📦 Build & Deployment

### 1. Build Project

```bash
npm run build
# or
yarn build
```

You will see output like:

```
Build succeeded
Build mode................ spa
Pkg quasar................ v2.11.7
Pkg @quasar/app-webpack... v3.7.2
Pkg webpack............... v5
Debugging................. no
Publishing................ no
Transpiled JS............. yes (Babel)
==========================
Output folder............. dist/spa
```

### 2. Deploy to Web Server

Copy the output folder to your web server directory:

```bash
cp -r dist/spa/* /var/www/your-domain.com/html/
```

For **Nginx**, an example config:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/your-domain.com/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🧾 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.
