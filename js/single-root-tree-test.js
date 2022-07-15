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

  const txn = tree.txn();
  const key = BLAKE2b.digest(Buffer.alloc(4, 0x01));
  const value = Buffer.alloc(4, 0x01);

  await txn.insert(key, value);
  await txn.commit();

  await tree.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
