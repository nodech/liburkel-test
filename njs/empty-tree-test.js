'use strict';

const {Tree} = require('nurkel');

(async () => {
  const tree = new Tree({
    prefix: './tree'
  });

  await tree.open();

  await tree.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
