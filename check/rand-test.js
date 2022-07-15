'use strict';

const path = require('path');
const fs = require('bfile');
const {SHA256} = require('bcrypto');

const CDIR = process.argv[2];
const JSDIR = process.argv[3];

const FNAME = 'rand';

(async () => {
  const pathC = path.join(CDIR, FNAME);
  const pathJS = path.join(JSDIR, FNAME);

  const fileC = await fs.readFile(pathC);
  const fileJS = await fs.readFile(pathJS);

  const hashC = SHA256.digest(fileC).toString('hex');
  const hashJS = SHA256.digest(fileJS).toString('hex');

  if (hashC !== hashJS) {
    throw new Error(`Hash of ${pathC} does not equal ${pathJS}. \n`
      + `${hashC} != ${hashJS}`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
