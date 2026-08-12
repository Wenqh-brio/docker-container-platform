# VM Management Platform

## Overview
This repository contains a **full‑stack web platform** that lets users:

1. **Register & log in** – credentials are stored securely in an SQLite database using **bcrypt** hashing and a placeholder captcha field.
2. **Manage Docker containers** – create, list and destroy containers via a simple REST API (Kubernetes support is planned).
3. **Run small projects** – a placeholder endpoint shows where you could clone a repo and execute it inside a container.
4. **Interact through a clean UI** – built with **Bootstrap** and vanilla JavaScript, with a placeholder for a future web‑terminal (e.g., `xterm.js`).

The project is released under the **MIT License**.

## Project Structure
```
.
├── backend
│   ├── db.js          # SQLite helper & schema creation
│   └── server.js      # Express server with auth & Docker APIs
├── frontend
│   ├── css
│   │   └── style.css
│   ├── js
│   │   └── app.js    # Simple SPA handling UI & API calls
│   └── index.html    # Main page
├── data                # SQLite DB file (created at runtime)
├── start.sh            # One‑click startup for Linux/macOS
├── start.bat           # One‑click startup for Windows
├── Dockerfile
├── docker-compose.yml
├── .gitignore
├── package.json
├── LICENSE.md
└── Readme.md
```

## Prerequisites
* **Node.js** (v18 or later) – required for local development.
* **Docker** daemon – needed for container management (also used by the Docker image).
* (Optional) **Kubernetes** cluster – future feature.

## One‑Click Startup
The repository ships with scripts that set everything up and launch the server with a single command.

### Linux / macOS
```bash
chmod +x start.sh
./start.sh
```
The script will:
1. Create the `data/` directory for the SQLite DB.
2. Install any missing Node.js dependencies.
3. Start the backend server on **port 3000**.
4. Open the web UI in your default browser.

### Windows
```bat
start.bat
```
The batch file performs the same steps on Windows.

### Docker (alternative)
If you prefer containerised deployment, you can still use Docker Compose:
```bash
docker compose up --build -d
```
The service will be reachable at `http://localhost:3000`.

## Deploying to Cloudflare (public website)
To expose the UI publicly you can use **Cloudflare Pages** for the static front‑end and **Cloudflare Tunnel** (formerly Argo Tunnel) to forward traffic to the backend running on your server.

1. **Deploy the static files** (`frontend/` folder) to Cloudflare Pages – this will serve the HTML, CSS and JS.
2. **Create a Cloudflare Tunnel** on the host where the backend runs:
   ```bash
   cloudflared tunnel create vm-platform
   cloudflared tunnel route dns vm-platform yourdomain.com
   cloudflared tunnel run vm-platform
   ```
   The tunnel will expose the backend on `http://yourdomain.com` while the front‑end remains on Cloudflare Pages.
3. Update the front‑end `app.js` API base URL if needed (it defaults to the same origin).

   **Tip:** Cloudflare Pages allows you to define environment variables in the project settings. Create a variable named `API_BASE_URL` with the URL of your backend service (e.g., `https://api.yourdomain.com`). The front‑end will automatically read this value via `window._env_.API_BASE_URL`.

## Security Notes
* **Password hashing** – `bcrypt` with a cost factor of 12.
* **SQL injection protection** – all queries use prepared statements.
* **Rate limiting** – `express-rate-limit` limits to 100 requests per 15 minutes per IP.
* **XSS protection** – `xss-clean` sanitises incoming data.
* **Captcha** – placeholder field; replace with Google reCAPTCHA or similar for production.

## Development Workflow
1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature
   ```
2. **Make changes**, then commit and push:
   ```bash
   git add .
   git commit -m "Describe your change"
   git push -u origin feature/your-feature
   ```
3. **Open a Pull Request** and merge into `main` when approved.
4. After merging, **deploy** using the one‑click scripts or Docker as described above.

## License
This project is licensed under the **MIT License** – see `LICENSE.md` for details.
