pkill -f "node backend/server.js" 
#!/usr/bin/env bash
set -e

mkdir -p data

#sudo systemctl start cloudflared

echo "Installing Node.js dependencies..."
npm install

echo "Starting the server..."
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi
nohup node backend/server.js > backend.log 2>&1 &

echo "Server is running at http://localhost:3000"
echo "Logs are written to backend.log"
