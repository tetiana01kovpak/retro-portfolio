import { build } from 'vite';
import { buildCvPdf } from './build-cv.mjs';

await build({ base: process.env.PAGES_BASE_PATH || '/' });
await buildCvPdf();
