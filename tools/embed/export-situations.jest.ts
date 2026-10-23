/**
 * Writes the situation examples to tools/embed/out/situations.json for build.py.
 *   npx jest --testRegex "export-situations\.jest\.ts$"
 */
import { test } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

import { SITUATION_DATA } from '../../src/mentor/react/situations';

test('export situations', () => {
  const out = path.join(__dirname, 'out');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'situations.json'), JSON.stringify(SITUATION_DATA, null, 1));
  console.log(`${SITUATION_DATA.length} situations`);
});
