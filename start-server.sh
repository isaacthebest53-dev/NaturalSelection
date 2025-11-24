#!/bin/bash
# Natural Selection Simulation - Server Launcher (Mac/Linux Version)
# This script starts a local web server and opens the simulation in your browser

PORT=8000
URL="http://localhost:${PORT}/circle_beings_simulation.html"

echo ""
echo "Starting Natural Selection Simulation Server..."
echo ""

# Function to open browser (works on both Mac and Linux)
open_browser() {
    sleep 2
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "$URL"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open "$URL" 2>/dev/null || sensible-browser "$URL" 2>/dev/null || echo "Please open $URL in your browser"
    else
        echo "Please open $URL in your browser"
    fi
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping server..."
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null
    fi
    echo "Server stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Try Python3 first (most common on Mac/Linux)
if command -v python3 &> /dev/null; then
    echo "Using Python3 HTTP Server..."
    python3 --version
    echo ""
    echo "Server starting on port ${PORT}..."
    echo "Opening browser in 2 seconds..."
    echo ""
    python3 -m http.server $PORT &
    SERVER_PID=$!
    open_browser
    echo "Server is running!"
    echo "URL: $URL"
    echo ""
    echo "Press Ctrl+C to stop the server"
    wait $SERVER_PID
    cleanup
fi

# Try Python as fallback
if command -v python &> /dev/null; then
    echo "Using Python HTTP Server..."
    python --version
    echo ""
    echo "Server starting on port ${PORT}..."
    echo "Opening browser in 2 seconds..."
    echo ""
    python -m http.server $PORT &
    SERVER_PID=$!
    open_browser
    echo "Server is running!"
    echo "URL: $URL"
    echo ""
    echo "Press Ctrl+C to stop the server"
    wait $SERVER_PID
    cleanup
fi

# Try Node.js with http-server
if command -v npx &> /dev/null; then
    echo "Using Node.js http-server..."
    echo ""
    echo "Server starting on port ${PORT}..."
    echo "Opening browser in 3 seconds..."
    echo ""
    npx --yes http-server -p $PORT --silent &
    SERVER_PID=$!
    sleep 3
    open_browser
    echo "Server is running!"
    echo "URL: $URL"
    echo ""
    echo "Press Ctrl+C to stop the server"
    wait $SERVER_PID
    cleanup
fi

# No suitable server found
echo "ERROR: No suitable web server found!"
echo ""
echo "Please install one of the following:"
echo "  1. Python 3 (recommended): https://www.python.org/downloads/"
echo "  2. Node.js: https://nodejs.org/"
echo ""
echo "After installation, run this script again."
echo ""
exit 1

