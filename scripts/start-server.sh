#!/bin/bash

# ローカル開発サーバーの起動

PORT=${1:-8080}

echo "Starting local server on port $PORT..."
echo "Open http://localhost:$PORT in your browser"
echo "Press Ctrl+C to stop the server"

if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m http.server $PORT
elif command -v node &> /dev/null && npm list -g live-server &> /dev/null; then
    live-server --port=$PORT
else
    echo "Error: No suitable server found. Please install Python3 or Node.js with live-server"
    exit 1
fi
