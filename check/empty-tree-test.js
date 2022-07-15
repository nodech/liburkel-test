'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('bfile');

const CDIR = process.argv[2];
const JSDIR = process.argv[3];
const DIRNAME = 'tree';

(async () => {
  const pathC = path.join(CDIR, DIRNAME);
  const pathJS = path.join(JSDIR, DIRNAME);

  const metaC = await fs.readFile(path.join(pathC, 'meta'));
  const metaJS = await fs.readFile(path.join(pathJS, 'meta'));

  // These metas are random, can't compare.
  assert(metaC.length === 32);
  assert(metaJS.length === 32);
  // METAs are randomized.
  assert(!metaC.equals(metaJS));

  const fblockC = await fs.readFile(path.join(pathC, '0000000001'));
  const fblockJS = await fs.readFile(path.join(pathJS, '0000000001'));

  assert(fblockC.length === 0);
  assert(fblockJS.length === 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
