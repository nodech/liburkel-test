'use strict';

const {Tree} = require('nurkel');

async function insert(txn, n) {
  const key = Buffer.alloc(4, 0x00);
  key.writeUint32LE(n, 0);
  const value = key.slice();
  const hash = await Tree.hash(key);

  await txn.insert(hash, value);
}

(async () => {
  const tree = new Tree({
    prefix: './tree'
  });
  let fifthRoot = null;

  await tree.open();

  let k = 0;
  for (let i = 0; i < 10; i++) {
    const txn = tree.txn();
    await txn.open();

    for (let j = 0; j < 10; j++)
      await insert(txn, k++);

    await txn.commit();
    await txn.close();

    if (i === 4)
      fifthRoot = tree.rootHash();
  }

  const txn = tree.txn();
  await txn.open();

  for (let i = 0; i < 10; i++)
    await insert(txn, k++);

  await tree.inject(fifthRoot);

  await txn.commit();
  await txn.close();

  await tree.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
