#!/usr/bin/env bash

# One‑click startup script for the VM Management Platform
# ------------------------------------------------------
# This script ensures the required data directory exists, installs any missing
# Node.js dependencies, starts the backend server, and opens the web UI in the
# default browser.

set -e

# Ensure the data directory exists (SQLite database location)
mkdir -p data

echo "Installing Node.js dependencies..."
npm install

echo "Starting the server..."
# Run the server in the background
npm start &
SERVER_PID=$!

# Give the server a moment to start up
sleep 5

# Open the UI in the default browser (Linux/macOS)
if command -v xdg-open > /dev/null; then
  xdg-open http://localhost:3000
elif command -v open > /dev/null; then
  open http://localhost:3000
else
  echo "Please open http://localhost:3000 in your browser."
fi

# Wait for the server process to keep the script alive (optional)
wait $SERVER_PID