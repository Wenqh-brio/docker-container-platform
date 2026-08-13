require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const bcrypt = require('bcrypt');
const db = require('./db');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const path = require('path');

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      upgradeInsecureRequests: null
    }
  },
  hsts:false
}));
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(xss());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Simple captcha placeholder middleware
function captchaCheck(req, res, next) {
  const { captchaToken } = req.body;
  if (!captchaToken) {
    return res.status(400).json({ error: 'Captcha token missing' });
  }
  // TODO: verify captcha with external service
  next();
}

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    const hash = await bcrypt.hash(password, 12);
    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    stmt.run(username, hash, function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Registration failed' });
      }
      res.json({ message: 'User registered' });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  stmt.get(username, async (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // In production, issue JWT. Here we just return user id.
    res.json({ message: 'Login successful', userId: row.id });
  });
});

// Mock authentication middleware (demo only)
function mockAuth(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Missing authentication' });
  }
  req.userId = userId;
  next();
}

// List Docker containers
app.get('/api/containers', mockAuth, async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    res.json(containers);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list containers' });
  }
});

// Create a Docker container
app.post('/api/containers', mockAuth, async (req, res) => {
  const { image = 'alpine', cmd = ['/bin/sh'] } = req.body;
  try {
    const container = await docker.createContainer({ Image: image, Cmd: cmd, Tty: true });
    await container.start();
    res.json({ message: 'Container started', id: container.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create container' });
  }
});

// Delete a Docker container
app.delete('/api/containers/:id', mockAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const container = docker.getContainer(id);
    await container.stop();
    await container.remove();
    res.json({ message: 'Container removed' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to remove container' });
  }
});

// Placeholder for running a small project inside a container
app.post('/api/run-project', mockAuth, async (req, res) => {
  const { repoUrl } = req.body;
  // TODO: clone repo, build, run inside container
  res.json({ message: 'Project execution started (placeholder)' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});