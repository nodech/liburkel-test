'use strict';

const os = require('os');
const path = require('path');
const cp = require('child_process');
const {randomBytes} = require('crypto');
const fs = require('bfile');

class TestError extends Error {
  constructor(message, step, name, code) {
    super(message);

    this.step = step;
    this.name = name;
    this.code = code == null ? -1 : code;
  }
}

function getTmpDir() {
  const bytes = randomBytes(8).toString('hex');
  return path.join(os.tmpdir(), 'liburkel-integration-' + bytes);
}

// Configuration
const {tests} = require('./config');

const getCBin = name => path.join(__dirname, 'build', name);
const getJSCmd = name => 'node ' + path.join(__dirname, 'js', `${name}.js`);
const getCheckCmd = (name) => {
  return 'node ' + path.join(__dirname, 'check', `${name}.js`);
};

function exec(name, cwd, timeout) {
  return new Promise((resolve, reject) => {
    cp.exec(name, { cwd, timeout }, (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }

      if (stderr.length !== 0) {
        reject(new Error('STDERR: ' + stderr.toString('utf8').trim()));
        return;
      }

      resolve(stdout.toString('utf8').trim());
    });
  });
}

async function setupTree(root) {
  const treePath = path.join(root, 'tree');

  await fs.mkdirp(treePath);
  await fs.writeFile(path.join(treePath, '0000000001'), '');
  await fs.writeFile(path.join(treePath, 'meta'), Buffer.alloc(32, 0x89));
}

const tmpdir = getTmpDir();
(async () => {
  console.log(`Running checks in ${tmpdir}`);
  for (const test of tests) {
    const {name, desc} = test;
    let setup = test.setup;

    console.log(`Testing ${name}: ${desc}`);
    // prepare directory
    const testdir = path.join(tmpdir, name);
    const cdir = path.join(testdir, 'c');
    const jsdir = path.join(testdir, 'js');

    await fs.mkdirp(cdir);
    await fs.mkdirp(jsdir);

    if (setup == null)
      setup = true;

    if (setup) {
      // Make trees deterministic.
      await setupTree(cdir);
      await setupTree(jsdir);
    }

    let cmd, res;

    cmd = getCBin(name);

    try {
      console.log(`  Running C version for: ${name}.`);
      res = await exec(`"${cmd}"`, cdir);

      if (res.length !== 0)
        console.log(res);
    } catch (e) {
      throw new TestError(e.message, 'c', name, e.code);
    }

    cmd = getJSCmd(name);
    try {
      console.log(`  Running JS version for: ${name}.`);
      res = await exec(cmd, jsdir);

      if (res.length !== 0)
        console.log(res);
    } catch (e) {
      throw new TestError(e.message, 'js', name, e.code);
    }

    // run Checker
    cmd = getCheckCmd(name);
    try {
      console.log(`  Running check for: ${name}...`);
      res = await exec(`${cmd} ${cdir} ${jsdir}`, testdir);

      if (res.length !== 0)
        console.log(res);
    } catch (e) {
      throw new TestError(e.message, 'check', name, e.code);
    }
  }

  console.log(`Cleaning up ${tmpdir}...`);
  await fs.rimraf(tmpdir);
})().catch((e) => {
  console.error('');
  console.error(`Test directory: ${tmpdir}`);
  switch (e.step) {
    case 'c': {
      console.error(`Failed C test run for: ${e.name}, exit code: ${e.code}`);
      console.error(e.message);
      break;
    }
    case 'js': {
      console.error(`Failed JS test run for: ${e.name}, exit code: ${e.code}`);
      console.error(e.message);
      break;
    }
    case 'check': {
      console.error(`Test failed for: ${e.name}, exit code: ${e.code}`);
      console.error(e.message);
      break;
    }
    default: {
      console.error('Test runner failed.');
      console.error(e);
    }
  }
  process.exit(1);
});
