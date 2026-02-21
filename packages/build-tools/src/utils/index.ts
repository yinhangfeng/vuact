import { resolve } from 'path';
import { readFileSync } from 'fs';
import type { UserConfig } from 'vite';

export function getPackageRoot(config: UserConfig) {
  if (!config.root) {
    return process.cwd();
  }
  return resolve(process.cwd(), config.root);
}

export function getPackageJson(root: string) {
  return JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
}
