'use strict';

const {BLAKE2b} = require('bcrypto');
const {Tree} = require('urkel');

async function insert(txn, n) {
  const key = Buffer.alloc(4, 0x00);
  key.writeUint32LE(n, 0);
  const value = key.slice();
  const hash = BLAKE2b.digest(key);

  await txn.insert(hash, value);
}

(async () => {
  const tree = new Tree({
    hash: BLAKE2b,
    bits: 256,
    prefix: './tree'
  });

  await tree.open();

  let k = 0;
  for (let i = 0; i < 2; i++) {
    const txn = tree.txn();
    await insert(txn, k++);
    await txn.commit();

    // add empty commit on top
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
