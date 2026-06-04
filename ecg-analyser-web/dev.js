import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function portInUse(port) {
  try {
    execSync(`netstat -ano | findstr :${port}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function killProcessOnPort(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split('\n')) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
        console.log(`Killed stale process PID ${pid} on port ${port}`);
      } catch { /* already gone */ }
    }
  } catch { /* nothing on this port */ }
}

function run(name, cwd, command, args) {
  const proc = spawn(command, args, { cwd, stdio: 'pipe', shell: true });
  proc.stdout.on('data', (d) => {
    for (const line of d.toString().split('\n').filter(Boolean)) {
      console.log(`[${name}] ${line}`);
    }
  });
  proc.stderr.on('data', (d) => {
    for (const line of d.toString().split('\n').filter(Boolean)) {
      console.error(`[${name}] ${line}`);
    }
  });
  proc.on('close', (code) => {
    console.log(`[${name}] exited with code ${code}`);
  });
  return proc;
}

const serverDir = join(__dirname, 'server');
const clientDir = join(__dirname, 'client');

for (const port of [3001, 5173]) {
  if (portInUse(port)) {
    console.log(`Port ${port} is busy — killing stale process...`);
    killProcessOnPort(port);
  }
}

console.log('Starting server (port 3001) and client (port 5173)...');
const server = run('server', serverDir, 'node', ['--watch', 'index.js']);
const client = run('client', clientDir, 'npx', ['vite']);

process.on('SIGINT', () => {
  server.kill();
  client.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  server.kill();
  client.kill();
  process.exit();
});
