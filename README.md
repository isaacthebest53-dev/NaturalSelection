# Natural Selection Simulation

## Running the Simulation

**IMPORTANT**: This project uses ES6 modules, which require a web server. You cannot open the HTML file directly in your browser using the `file://` protocol.

### Option 0: Quick Start Scripts (Windows - Easiest!)

**PowerShell Script (Recommended):**
```powershell
.\start-server.ps1
```

**Batch File (Alternative):**
```batch
start-server.bat
```

These scripts will automatically:
- Detect if you have Python or Node.js installed
- Start the appropriate web server on port 8000
- Open your browser to the simulation
- Stop the server when you're done (Ctrl+C)

**Note:** If you get an execution policy error with PowerShell, you may need to run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Option 1: Python HTTP Server (Recommended)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open: `http://localhost:8000/circle_beings_simulation.html`

### Option 2: Node.js HTTP Server
```bash
npx http-server -p 8000
```
Then open: `http://localhost:8000/circle_beings_simulation.html`

### Option 3: VS Code Live Server
If you're using VS Code, install the "Live Server" extension and click "Go Live" in the status bar.

### Option 4: Any Other Web Server
You can use any web server (Apache, Nginx, etc.) to serve the files.

## Troubleshooting

If you see errors in the browser console about CORS or modules not loading, make sure you're accessing the file through a web server, not directly via `file://`.

