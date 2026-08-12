// Frontend SPA for VM Management Platform
// -------------------------------------------------
// This script provides registration, login, and container management UI.
// It reads the backend API base URL from environment variables to work
// both locally (default http://localhost:3000) and when deployed to
// Cloudflare Pages.

// Determine API base URL
const API_BASE_URL =
  // Cloudflare Pages can inject variables into a global _env_ object
  (window && window._env_ && window._env_.API_BASE_URL) ||
  // Vite/ESM style environment variables (if built with a bundler)
  (import.meta && import.meta.env && import.meta.env.API_BASE_URL) ||
  // Fallback for local development
  "http://localhost:3000";

// Create an Axios instance with the base URL
const api = axios.create({ baseURL: API_BASE_URL });

// Simple helper to store the mock authenticated user ID
function setUserId(id) {
  localStorage.setItem("userId", id);
}
function getUserId() {
  return localStorage.getItem("userId");
}

// Reference to the main app container
const appDiv = document.getElementById("app");

// ---------- UI Rendering Functions ----------
function renderLogin() {
  appDiv.innerHTML = `
    <div class="card mx-auto" style="max-width: 400px;">
      <div class="card-body">
        <h5 class="card-title">Login</h5>
        <form id="loginForm">
          <div class="mb-3">
            <label class="form-label">Username</label>
            <input type="text" class="form-control" name="username" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" name="password" required />
          </div>
          <button type="submit" class="btn btn-primary w-100">Login</button>
        </form>
        <hr />
        <p class="text-center">Or <a href="#" id="showRegister">Register</a></p>
      </div>
    </div>
  `;
  document
    .getElementById("loginForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const data = {
        username: form.username.value,
        password: form.password.value,
      };
      try {
        const resp = await api.post("/api/login", data);
        setUserId(resp.data.userId);
        renderDashboard();
      } catch (err) {
        alert(err.response?.data?.error || "Login failed");
      }
    });
  document
    .getElementById("showRegister")
    .addEventListener("click", (e) => {
      e.preventDefault();
      renderRegister();
    });
}

function renderRegister() {
  appDiv.innerHTML = `
    <div class="card mx-auto" style="max-width: 400px;">
      <div class="card-body">
        <h5 class="card-title">Register</h5>
        <form id="registerForm">
          <div class="mb-3">
            <label class="form-label">Username</label>
            <input type="text" class="form-control" name="username" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" name="password" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Captcha (placeholder)</label>
            <input type="text" class="form-control" name="captchaToken" placeholder="Enter any text" required />
          </div>
          <button type="submit" class="btn btn-success w-100">Register</button>
        </form>
        <hr />
        <p class="text-center">Already have an account? <a href="#" id="showLogin">Login</a></p>
      </div>
    </div>
  `;
  document
    .getElementById("registerForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const data = {
        username: form.username.value,
        password: form.password.value,
        captchaToken: form.captchaToken.value,
      };
      try {
        await api.post("/api/register", data);
        alert("Registration successful, please login");
        renderLogin();
      } catch (err) {
        alert(err.response?.data?.error || "Registration failed");
      }
    });
  document
    .getElementById("showLogin")
    .addEventListener("click", (e) => {
      e.preventDefault();
      renderLogin();
    });
}

function renderDashboard() {
  const userId = getUserId();
  if (!userId) {
    renderLogin();
    return;
  }
  appDiv.innerHTML = `
    <h3>Welcome, User ${userId}</h3>
    <button id="listContainers" class="btn btn-primary mb-3">List Containers</button>
    <button id="createContainer" class="btn btn-success mb-3 ms-2">Create Container</button>
    <div id="terminal" class="mt-3" style="background:#000;color:#0f0;padding:1rem;max-height:400px;overflow:auto;">
      <em>Web terminal placeholder (future integration)</em>
    </div>
    <pre id="output" class="mt-3" style="background:#eee;padding:1rem;max-height:400px;overflow:auto;"></pre>
  `;
  document
    .getElementById("listContainers")
    .addEventListener("click", async () => {
      try {
        const resp = await api.get("/api/containers", {
          headers: { "X-User-Id": userId },
        });
        document.getElementById("output").textContent = JSON.stringify(
          resp.data,
          null,
          2
        );
      } catch (err) {
        alert("Failed to list containers");
      }
    });
  document
    .getElementById("createContainer")
    .addEventListener("click", async () => {
      const image = prompt("Docker image (default alpine):", "alpine");
      try {
        const resp = await api.post(
          "/api/containers",
          { image },
          { headers: { "X-User-Id": userId } }
        );
        alert("Container created: " + resp.data.id);
      } catch (err) {
        alert("Failed to create container");
      }
    });
}

// Initial render
renderLogin();
