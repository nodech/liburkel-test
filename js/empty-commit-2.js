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

  for (let i = 0; i < 20; i++) {
    const txn2 = tree.txn();
    await txn2.commit();
  }

  // one last empty commit
  const txn = tree.txn();
  await txn.commit();

  await tree.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
