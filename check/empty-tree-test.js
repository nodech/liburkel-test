'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('bfile');

const CDIR = process.argv[2];
const JSDIR = process.argv[3];
const NJSDIR = process.argv[4];
const DIRNAME = 'tree';

(async () => {
  const pathC = path.join(CDIR, DIRNAME);
  const pathJS = path.join(JSDIR, DIRNAME);
  const pathNJS = path.join(NJSDIR, DIRNAME);

  const metaC = await fs.readFile(path.join(pathC, 'meta'));
  const metaJS = await fs.readFile(path.join(pathJS, 'meta'));
  const metaNJS = await fs.readFile(path.join(pathNJS, 'meta'));

  // These metas are random, can't compare.
  assert(metaC.length === 32);
  assert(metaJS.length === 32);
  assert(metaNJS.length === 32);
  // METAs are randomized.
  assert(!metaC.equals(metaJS));
  assert(!metaC.equals(metaNJS));
  assert(!metaJS.equals(metaNJS));

  const fblockC = await fs.readFile(path.join(pathC, '0000000001'));
  const fblockJS = await fs.readFile(path.join(pathJS, '0000000001'));
  const fblockNJS = await fs.readFile(path.join(pathNJS, '0000000001'));

  assert(fblockC.length === 0);
  assert(fblockJS.length === 0);
  assert(fblockNJS.length === 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
