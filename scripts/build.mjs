import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync } from 'node:fs';
if (!process.env.npm_execpath) throw new Error('Run this build with npm run build');
execFileSync(process.execPath, [process.env.npm_execpath, '--prefix', 'site', 'run', 'build'], { stdio: 'inherit' });
mkdirSync('dist', { recursive: true });
cpSync('site/dist', 'dist', { recursive: true });
