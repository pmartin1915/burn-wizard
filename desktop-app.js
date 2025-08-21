#!/usr/bin/env node

/**
 * Burn Wizard Standalone Desktop Application
 * Packaged version for distribution
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
const PORT = 5175;
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

class BurnWizardDesktopApp {
  constructor() {
    this.server = null;
  }

  async start() {
    console.log(`🔥 Starting ${APP_NAME} Desktop Application...`);
    console.log(`📍 Running from: ${__dirname}`);
    
    // Check if dist folder exists
    if (!fs.existsSync(DIST_PATH)) {
      console.error(`❌ Build files not found at: ${DIST_PATH}`);
      console.error('Please ensure the application files are in the same directory.');
      process.exit(1);
    }

    try {
      await this.startServer();
      await this.openDesktopWindow();
      this.setupGracefulShutdown();
      
      console.log(`✅ ${APP_NAME} Desktop Application is running!`);
      console.log(`📱 Local URL: http://localhost:${PORT}`);
      console.log('📝 Medical calculations ready for offline use');
      console.log('🛑 Close this window or press Ctrl+C to stop');
      
      // Keep the process alive
      process.stdin.resume();
      
    } catch (error) {
      console.error('❌ Failed to start application:', error.message);
      console.error('Press any key to exit...');
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', () => process.exit(1));
    }
  }

  startServer() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        let filePath = path.join(DIST_PATH, req.url === '/' ? 'index.html' : req.url);
        
        // Handle SPA routing
        if (!fs.existsSync(filePath) && !req.url.includes('.')) {
          filePath = path.join(DIST_PATH, 'index.html');
        }

        // Security headers for medical application
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'no-referrer');

        fs.readFile(filePath, (err, content) => {
          if (err) {
            if (err.code === 'ENOENT') {
              res.writeHead(404, { 'Content-Type': 'text/html' });
              res.end(`<h1>404 Not Found</h1><p>File not found: ${req.url}</p>`);
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
    return new Promise((resolve) => {
      const url = `http://localhost:${PORT}`;
      
      // Windows-specific browser launching
      const browserCommands = [
        `start chrome --app=${url} --disable-web-security --window-size=1200,800 --window-position=100,50 --disable-extensions --no-first-run --user-data-dir="%TEMP%\\burn-wizard-chrome"`,
        `start msedge --app=${url} --window-size=1200,800 --disable-extensions --user-data-dir="%TEMP%\\burn-wizard-edge"`,
        `start ${url}`
      ];

      let launched = false;
      for (const command of browserCommands) {
        if (launched) break;
        
        exec(command, (error) => {
          if (!error && !launched) {
            console.log(`🌐 Opened ${APP_NAME} in dedicated window`);
            launched = true;
            resolve();
          }
        });
      }
      
      // Fallback resolve after 2 seconds
      setTimeout(resolve, 2000);
    });
  }

  setupGracefulShutdown() {
    const shutdown = () => {
      console.log(`\\n🛑 Shutting down ${APP_NAME}...`);
      
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
    
    // Handle window close
    process.on('SIGHUP', shutdown);
  }
}

// Start the application
const app = new BurnWizardDesktopApp();
app.start().catch(console.error);