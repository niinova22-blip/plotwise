/**
 * Writes every voiced line to tools/voice/out/lines.json for render.py.
 * Runs through Jest so the app's path aliases resolve:
 *   npx jest --testRegex "export-lines\.jest\.ts$"
 */
import { test } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

import { voicedLines } from '../../src/mentor/script';

test('export voiced lines', () => {
  const out = path.join(__dirname, 'out');
  fs.mkdirSync(out, { recursive: true });
  const data = { en: voicedLines('en'), tr: voicedLines('tr') };
  fs.writeFileSync(path.join(out, 'lines.json'), JSON.stringify(data, null, 1));
  console.log(`en ${data.en.length} lines, tr ${data.tr.length} lines`);
});
