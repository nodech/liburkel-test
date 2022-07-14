'use strict';

const fs = require('fs');
const {randomStuffByte} = require('./rand');

const SEED = 200;
const fd = fs.openSync('rand', 'w');

const buf = Buffer.alloc(1, 0x00);
const randGen = randomStuffByte(SEED);
for (let i = 0; i < 100000; i++) {
  const num = randGen.next().value;
  buf[0] = num;
  fs.writeSync(fd, buf);
}

fs.closeSync(fd);
