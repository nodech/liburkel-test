'use strict';

const path = require('path');
const util = require('../lib/util');

const CDIR = process.argv[2];
const JSDIR = process.argv[3];
const NJSDIR = process.argv[4];
const DIRNAME = 'tree';

(async () => {
  const pathC = path.join(CDIR, DIRNAME);
  const pathJS = path.join(JSDIR, DIRNAME);
  const pathNJS = path.join(NJSDIR, DIRNAME);

  await util.compareDirs(pathC, pathJS);
  await util.compareDirs(pathC, pathNJS);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
