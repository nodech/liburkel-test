'use strict';

const assert = require('assert');
const {BLAKE2b} = require('bcrypto');
const {Tree} = require('urkel');
const {randomStuffByte} = require('../lib/rand');

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

  // around 4 %
  if (byte <= 10)
    return OP_COMMIT;

  // around 1 %
  if (byte <= 13)
    return OP_REVERT;

  // around 95 %
  return OP_INSERT;
}

/*
 * Important thing to manage between this and C is to
 * maintain order of rand operations.
 */

async function run(nextRandByte) {
  const tree = new Tree({
    hash: BLAKE2b,
    bits: 256,
    prefix: './tree'
  });
  await tree.open();

  const roots = [];
  const keys = [];

  let txn = tree.txn();
  for (let i = 0; i < MAX_ITER; i++) {
    const decision = getDecision(nextRandByte);

    switch (decision) {
      case OP_INSERT: {
        const key = randKey(nextRandByte);
        const value = randValue(nextRandByte);
        await txn.insert(key, value);
        keys.push(key);
        break;
      }

      case OP_COMMIT: {
        const root = await txn.commit();
        roots.push(root);
        txn = tree.txn();
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
  }

  await txn.commit();
  await tree.compact();
  await tree.close();
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
