/* The public site's site/assets/mm.css is the ONLY copy of the brand tokens
   (CLAUDE.md). The app copies it at build time instead of keeping its own. */
import { copyFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
mkdirSync(path.resolve(here, '../public'), { recursive: true });
copyFileSync(path.resolve(here, '../../site/assets/mm.css'), path.resolve(here, '../public/mm.css'));
copyFileSync(path.resolve(here, '../../site/assets/favicon.svg'), path.resolve(here, '../public/favicon.svg'));
console.log('synced mm.css and favicon.svg from site/assets');
