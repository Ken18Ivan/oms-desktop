import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Copy preload.cjs from main to app directory
const source = path.join(__dirname, 'main', 'preload.cjs');
const dest = path.join(__dirname, 'app', 'preload.cjs');

try {
  fs.copyFileSync(source, dest);
  console.log('✓ Copied preload.cjs to app directory');
} catch (error) {
  console.error('✗ Failed to copy preload.cjs:', error.message);
  process.exit(1);
}
