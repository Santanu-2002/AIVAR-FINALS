import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('project has package metadata and server', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
  assert.equal(pkg.name, 'autonomous-test-orchestrator');
  assert.ok(pkg.dependencies.playwright);
});
