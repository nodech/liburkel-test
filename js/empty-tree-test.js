'use strict';

const {BLAKE2b} = require('bcrypto');
const {Tree} = require('urkel');

(async () => {
  const tree = new Tree({
    hash: BLAKE2b,
    bits: 256,
    prefix: './tree'
  });

  await tree.open();

  await tree.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
