'use strict';

const {Tree} = require('nurkel');

(async () => {
  const tree = new Tree({
    prefix: './tree'
  });

  await tree.open();

  for (let i = 0; i < 20; i++) {
    const txn2 = tree.txn();
    await txn2.open();
    await txn2.commit();
  }

  // one last empty commit
  const txn = tree.txn();
  await txn.open();
  await txn.commit();

  await txn.close();
  await tree.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
