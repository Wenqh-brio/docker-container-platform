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

// Determine language (simplified)
const userLang = (navigator.language || 'en').startsWith('zh') ? 'zh' : 'en';
const i18n = {
  en: {
    loginFailed: 'Login failed',
    registrationSuccess: 'Registration successful, please login',
    registrationFailed: 'Registration failed',
    missingFields: 'Username and password required',
    login: 'Login',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    orRegister: 'Or <a href="#" id="showRegister">Register</a>',
    alreadyAccount: 'Already have an account? <a href="#" id="showLogin">Login</a>',
    weakPassword: 'Password must be at least 8 characters, include uppercase, lowercase, number and special character',
  },
  zh: {
    loginFailed: '登录失败',
    registrationSuccess: '注册成功，请登录',
    registrationFailed: '注册失败',
    missingFields: '需要用户名和密码',
    login: '登录',
    register: '注册',
    username: '用户名',
    password: '密码',
    orRegister: '或者 <a href="#" id="showRegister">注册</a>',
    alreadyAccount: '已有账户？<a href="#" id="showLogin">登录</a>',
    weakPassword: '密码必须至少8位，且包含大小写字母、数字和特殊字符',
  },
};
function t(key){ return i18n[userLang][key] || key; }

function setMessage(id, text){
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Hash password client‑side (SHA‑256)
function hashPassword(pwd){
  return CryptoJS.SHA256(pwd).toString(CryptoJS.enc.Hex);
}

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
        <h5 class="card-title">${t('login')}</h5>
        <form id="loginForm">
          <div class="mb-3">
            <label class="form-label">${t('username')}</label>
            <input type="text" class="form-control" name="username" required />
          </div>
          <div class="mb-3">
            <label class="form-label">${t('password')}</label>
            <input type="password" class="form-control" name="password" required />
          </div>
          <button type="submit" class="btn btn-primary w-100">${t('login')}</button>
        </form>
        <hr />
        <div id="loginMsg" class="mt-2 text-danger"></div>
        <p class="text-center">${t('orRegister')}</p>
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
          password: hashPassword(form.password.value),
        };
      try {
        const resp = await api.post("/api/login", data);
        setUserId(resp.data.userId);
        renderDashboard();
      } catch (err) {
        setMessage('loginMsg', err.response?.data?.error || t('loginFailed'));
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
        <h5 class="card-title">${t('register')}</h5>
        <form id="registerForm">
          <div class="mb-3">
            <label class="form-label">${t('username')}</label>
            <input type="text" class="form-control" name="username" required />
          </div>
          <div class="mb-3">
            <label class="form-label">${t('password')}</label>
            <input type="password" class="form-control" name="password" required />
          </div>

          <button type="submit" class="btn btn-success w-100">${t('register')}</button>
        </form>
        <hr />
        <div id="registerMsg" class="mt-2 text-danger"></div>
        <p class="text-center">${t('alreadyAccount')}</p>
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
          password: hashPassword(form.password.value),
        };
      try {
          await api.post("/api/register", data);
          renderLogin();
          setMessage('loginMsg', t('registrationSuccess'));

        } catch (err) {
          setMessage('registerMsg', err.response?.data?.error || t('registrationFailed'));
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
