// Replaces dist/, the folder GitHub Pages publishes, with the latest static build.
import { cp, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const websiteDirectory = path.resolve(import.meta.dirname, '..');
const buildDirectory = path.join(websiteDirectory, 'build', 'client');
const distDirectory = path.join(websiteDirectory, 'dist');

for (const page of ['index.html', 'guides/index.html', 'CNAME']) {
  try {
    await stat(path.join(buildDirectory, page));
  } catch {
    console.error(`build/client/${page} is missing; run react-router build first.`);
    process.exit(1);
  }
}

await rm(distDirectory, { recursive: true, force: true });
await cp(buildDirectory, distDirectory, { recursive: true });
console.log(`Exported ${path.relative(process.cwd(), buildDirectory)} to ${path.relative(process.cwd(), distDirectory)}.`);
