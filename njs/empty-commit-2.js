'use strict';

const {Tree} = require('nurkel');
const {createTXN} = require('../lib/util');

(async () => {
  const tree = new Tree({
    prefix: './tree'
  });

  await tree.open();

  for (let i = 0; i < 20; i++) {
    const txn2 = createTXN(tree);
    await txn2.open();
    await txn2.commit();
  }

  // one last empty commit
  const txn = createTXN(tree);
  await txn.open();
  await txn.commit();

  await txn.close();
  await tree.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
