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
  for (let i = 0; i < 10; i++) {
    const txn = tree.txn();
    for (let j = 0; j < 10; j++)
      await insert(txn, k++);

    await txn.commit();
  }

  await tree.compact();
  await tree.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
