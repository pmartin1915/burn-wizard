#!/usr/bin/env node

/**
 * Burn Wizard Desktop Launcher
 * 
 * This script creates a desktop-like experience by:
 * 1. Serving the built application locally
 * 2. Opening it in a dedicated browser window
 * 3. Providing desktop integration features
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const PORT = 8080;
const APP_NAME = 'Burn Wizard';
const DIST_PATH = path.join(__dirname, 'dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2'
};

class BurnWizardDesktop {
  constructor() {
    this.server = null;
    this.browserProcess = null;
  }

  async start() {
    console.log(`🔥 Starting ${APP_NAME} Desktop...`);
    
    // Check if dist folder exists
    if (!fs.existsSync(DIST_PATH)) {
      console.error('❌ Build not found. Please run "npm run build" first.');
      process.exit(1);
    }

    try {
      await this.startServer();
      this.openDesktopWindow();
      this.setupGracefulShutdown();
      
      console.log(`✅ ${APP_NAME} Desktop is running!`);
      console.log(`📱 Application: http://localhost:${PORT}`);
      console.log('📝 Medical calculations ready for offline use');
      console.log('🛑 Press Ctrl+C to stop');
      
    } catch (error) {
      console.error('❌ Failed to start:', error.message);
      process.exit(1);
    }
  }

  startServer() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        let filePath = path.join(DIST_PATH, req.url === '/' ? 'index.html' : req.url);
        
        // Handle SPA routing - serve index.html for routes that don't correspond to files
        if (!fs.existsSync(filePath) && !req.url.includes('.')) {
          filePath = path.join(DIST_PATH, 'index.html');
        }

        // Security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');

        fs.readFile(filePath, (err, content) => {
          if (err) {
            if (err.code === 'ENOENT') {
              res.writeHead(404, { 'Content-Type': 'text/html' });
              res.end('<h1>404 Not Found</h1>');
            } else {
              res.writeHead(500);
              res.end('Internal Server Error');
            }
          } else {
            const ext = path.extname(filePath);
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
          }
        });
      });

      this.server.listen(PORT, 'localhost', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  openDesktopWindow() {
    const url = `http://localhost:${PORT}`;
    
    // Windows-specific browser launching
    const browserCommands = [
      // Chrome with app mode
      `start chrome --app=${url} --disable-web-security --window-size=1200,800 --window-position=100,50 --disable-extensions --no-first-run`,
      // Edge with app mode  
      `start msedge --app=${url} --window-size=1200,800 --disable-extensions`,
      // Default browser
      `start ${url}`
    ];

    for (const command of browserCommands) {
      try {
        require('child_process').exec(command, (error) => {
          if (!error) {
            console.log(`🌐 Opened ${APP_NAME} in browser`);
          }
        });
        break;
      } catch (error) {
        continue;
      }
    }
  }

  setupGracefulShutdown() {
    const shutdown = () => {
      console.log('\\n🛑 Shutting down Burn Wizard Desktop...');
      
      if (this.server) {
        this.server.close(() => {
          console.log('✅ Server stopped');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}

// Handle command line arguments
if (require.main === module) {
  const desktop = new BurnWizardDesktop();
  desktop.start().catch(console.error);
}

module.exports = BurnWizardDesktop;