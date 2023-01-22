'use strict';

const assert = require('assert');
const {BLAKE2b} = require('bcrypto');
const {Tree} = require('nurkel');
const {randomStuffByte} = require('../lib/rand');
const fs = require('bfile');

const MAX_ITER = 40000;

const OP_COMMIT = 1;
const OP_INSERT = 2;
const OP_REVERT = 3;

function randBytes(nextRandByte, n) {
  const buf = Buffer.alloc(n, 0x00);

  for (let i = 0; i < n; i++)
    buf[i] = nextRandByte();

  return buf;
}

function randKey(nextRandByte) {
  const keySize = nextRandByte();
  const key = randBytes(nextRandByte, keySize);
  const hash = BLAKE2b.digest(key);

  return hash;
}

function randValue(nextRandByte) {
  const size = nextRandByte();
  return randBytes(nextRandByte, size);
}

function getDecision(nextRandByte) {
  const byte = nextRandByte();

  // around 10 %
  if (byte <= 25)
    return OP_COMMIT;

  // around 5 %
  if (byte <= 38)
    return OP_REVERT;

  // around 85 %
  return OP_INSERT;
}

/*
 * Important thing to manage between this and C is to
 * maintain order of rand operations.
 */

async function run(nextRandByte) {
  const tree = new Tree({
    prefix: './tree'
  });
  const fd = await fs.open('./proofs', 'w');

  await tree.open();
  const roots = [];
  const keys = [];

  let txn = tree.vtxn();
  await txn.open();
  for (let i = 0; i < MAX_ITER; i++) {
    const decision = getDecision(nextRandByte);

    switch (decision) {
      case OP_INSERT: {
        const rnum = nextRandByte();
        let key = null;

        if (rnum <= 25) {
          const keyat = keys[nextRandByte() % keys.length];
          key = keyat;
        } else {
          key = randKey(nextRandByte);
        }

        const value = randValue(nextRandByte);
        await txn.insert(key, value);
        keys.push(key);
        break;
      }

      case OP_COMMIT: {
        const root = await txn.commit();
        roots.push(root);
        await txn.close();
        txn = tree.vtxn();
        await txn.open();
        break;
      }

      case OP_REVERT: {
        if (roots.length === 0)
          break;

        const rnum = nextRandByte();
        const root = roots[rnum % roots.length];
        await tree.inject(root);
        break;
      }

      default: {
        throw new Error('Unknown decision.');
      }
    }

    if (roots.length > 0 && keys.length > 0) {
      let rnum = nextRandByte();
      const key = keys[rnum % keys.length];
      rnum = nextRandByte();
      const root = roots[rnum % roots.length];
      const snap = tree.snapshot(root);
      await snap.open();
      const proof = await snap.prove(key);
      const proofRaw = proof.encode();

      await snap.close();
      await fs.write(fd, proofRaw, 0, proofRaw.length);
    }
  }

  await txn.commit();
  await txn.close();
  await tree.close();
  await fs.close(fd);
}

(async () => {
  const seedArg = process.argv[2] || 2022;
  const seed = Number(seedArg);

  assert(!Number.isNaN(seed));
  const randGen = randomStuffByte(seed);
  const nextRandByte = () => {
    const {value, done} = randGen.next();
    assert(!done);
    return value;
  };

  await run(nextRandByte);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
