'use strict';

const assert = require('bsert');
const {join} = require('path');
const fs = require('bfile');

const CDIR = process.argv[2];
const JSDIR = process.argv[3];
const NJSDIR = process.argv[3];
const DIRNAME = 'tree';

async function collectData(path) {
  const data = {
    path: join(path, DIRNAME),
    files: new Map(),
    meta: null
  };

  const files = await fs.readdir(data.path);

  for (const file of files) {
    if (file === 'meta')
      continue;

    const buffer = await fs.readFile(join(data.path, file));
    data.files.set(file, buffer);
  }

  files.meta = await fs.readFile(join(data.path, 'meta'));

  return data;
}

(async () => {
  const [js, c, njs] = [
    await collectData(JSDIR),
    await collectData(CDIR),
    await collectData(NJSDIR)
  ];

  assert.strictEqual(js.files.size, c.files.size);
  assert.strictEqual(js.files.size, njs.files.size);
  assert.deepStrictEqual(js.files.keys(), c.files.keys());
  assert.deepStrictEqual(js.files.keys(), njs.files.keys());

  for (const [file, content] of Object.entries(js.files)) {
    const contentC = c.files.get(file);
    const contentNJS = njs.files.get(file);
    assert(Buffer.isBuffer(contentC));
    assert(Buffer.isBuffer(contentNJS));

    // Because we don't control/can't setup metas for the
    // compacted tree. We just check the contents.
    const sliced = content.slice(0, -20);
    const slicedC = contentC.slice(0, -20);
    const slicedNJS = contentNJS.slice(0, -20);

    assert.bufferEqual(sliced, slicedC);
    assert.bufferEqual(sliced, slicedNJS);

    const left = content.slice(-20);
    const leftC = contentC.slice(-20);
    const leftNJS = contentNJS.slice(-20);

    assert.notBufferEqual(left, leftC);
    assert.notBufferEqual(left, leftNJS);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
