const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWin = process.platform === 'win32';

// 1. Determine Python path (isolated venv if exists, otherwise fallback to system python)
let pythonExe = 'python';
const venvPath = isWin 
  ? path.join(__dirname, 'env', 'Scripts', 'python.exe')
  : path.join(__dirname, 'env', 'bin', 'python');

if (fs.existsSync(venvPath)) {
  pythonExe = venvPath;
}

console.log(`[Ptah Launcher] Using Python executable: ${pythonExe}`);

// 2. Start Python FastAPI Backend Server (runs Kokoro TTS)
console.log('[Ptah Launcher] Starting Kokoro TTS Backend Server on port 8880...');
const backend = spawn(pythonExe, [path.join(__dirname, 'kokoro_server', 'server.py')], {
  stdio: 'inherit',
  shell: true
});

// 3. Start React Frontend Server using pnpm/npm
console.log('[Ptah Launcher] Starting React Frontend on port 3000...');
// Use pnpm if pnpm-lock.yaml exists, otherwise fallback to npm
const hasPnpm = fs.existsSync(path.join(__dirname, 'pnpm-lock.yaml'));
const pkgCmd = hasPnpm ? (isWin ? 'pnpm.cmd' : 'pnpm') : (isWin ? 'npm.cmd' : 'npm');

console.log(`[Ptah Launcher] Using package manager command: ${pkgCmd}`);
const frontend = spawn(pkgCmd, ['start'], {
  stdio: 'inherit',
  shell: true
});

// 4. Handle process termination to clean up child processes on exit
const cleanUp = () => {
  console.log('[Ptah Launcher] Stopping servers...');
  try {
    backend.kill();
  } catch (e) {}
  try {
    frontend.kill();
  } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanUp);
process.on('SIGTERM', cleanUp);
process.on('exit', cleanUp);
