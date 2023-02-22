'use strict';

const {BLAKE2b} = require('bcrypto');
const {Tree} = require('nurkel');
const {createTXN} = require('../lib/util');

(async () => {
  const tree = new Tree({
    prefix: './tree'
  });

  await tree.open();

  const txn = createTXN(tree);
  const key = BLAKE2b.digest(Buffer.alloc(4, 0x01));
  const value = Buffer.alloc(4, 0x01);

  await txn.open();
  await txn.insert(key, value);
  await txn.commit();
  await txn.close();
  await tree.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
