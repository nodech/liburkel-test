'use strict';

function *randomStuff(seed) {
  let next = seed;
  let result;

  for (;;) {
    next = mul32(next, 1103515245);
    next = (next + 12345) | 0;
    result = ((next / 65536) % 2048) | 0;

    next = mul32(next, 1103515245);
    next = (next + 12345) | 0;
    result <<= 10;
    result ^= ((next / 65536) % 1024);

    next = mul32(next, 1103515245);
    next = (next + 12345) | 0;
    result <<= 10;
    result ^= ((next / 65536) % 1024);

    yield result;
  }
}

function *randomStuffByte(seed) {
  const rand = randomStuff(seed);

  for (;;) {
    yield rand.next().value & 0xff;
  }
}

function mul32(a, b) {
  const loa = a & 0xffff;
  const hia = a >>> 16;
  const lob = b & 0xffff;
  const hib = b >>> 16;

  let lor = 0;
  let hir = 0;

  lor += loa * lob;
  hir += lor >>> 16;
  lor &= 0xffff;
  hir += loa * hib;
  hir &= 0xffff;
  hir += hia * lob;
  hir &= 0xffff;

  return (hir << 16) | lor;
}

function mul32rp(a, b) {
  let res = 0;
  while (b) {
    if (b & 0x01)
      res = (res + a) | 0;

    b >>= 1;
    a <<= 1;
  }

  return res;
}

exports.mul32 = mul32;
exports.mul32rp = mul32rp;
exports.randomStuff = randomStuff;
exports.randomStuffByte = randomStuffByte;
