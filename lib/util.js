'use strict';

const assert = require('assert');
const path = require('path');
const {SHA256} = require('bcrypto');
const fs = require('bfile');

exports.sha256File = (file) => {
  return new Promise((resolve, reject) => {
    const sha = new SHA256();
    sha.init();
    const stream = fs.createReadStream(file);

    let done = false;

    stream.once('close', () => {
      done = true;

      resolve(sha.final());
    });

    stream.on('readable', () => {
      let chunk = stream.read();

      while (chunk != null) {
        sha.update(chunk);
        chunk = stream.read();
      }
    });

    stream.once('error', (err) => {
      if (done)
        return;

      try {
        stream.destroy();
      } catch (e) {
        ;
      }

      reject(err);
    });
  });
};

exports.compareDirs = async (a, b) => {
  const adirs = await fs.readdir(a);
  const bdirs = await fs.readdir(b);

  assert(adirs.length === bdirs.length,
    `${a} and ${b} have different number of files.`);

  for (const [i, name] of adirs.entries()) {
    const afile = path.join(a, name);
    const bfile = path.join(b, name);

    const error = `${afile} != ${bfile}.`;
    assert(bdirs[i] === name, error);

    const astat = await fs.stat(afile);
    const bstat = await fs.stat(bfile);

    // console.log(astat.isDirectory(), bstat.isDirectory());
    if (astat.isDirectory()) {
      assert(bstat.isDirectory(), `${afile} != ${bfile}`);
      assert(exports.compareDirs(afile, bfile));
      continue;
    }

    const asha = (await exports.sha256File(afile)).toString('hex');
    const bsha = (await exports.sha256File(bfile)).toString('hex');
    assert(asha === bsha, `${afile} != ${bfile}`);
  }
};

