'use strict';

const os = require('os');
const path = require('path');
const {randomBytes} = require('crypto');
const fs = require('bfile');
const {exec} = require('./lib/util');

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
const getNJSCmd = name => 'node ' + path.join(__dirname, 'njs', `${name}.js`);
const getCheckCmd = (name) => {
  return 'node ' + path.join(__dirname, 'check', `${name}.js`);
};

async function setupTree(root) {
  const treePath = path.join(root, 'tree');

  await fs.mkdirp(treePath);
  await fs.writeFile(path.join(treePath, '0000000001'), '');
  await fs.writeFile(path.join(treePath, 'meta'), Buffer.alloc(32, 0x89));
}

function simpleArgs() {
  const config = {
    bail: false,
    testName: null
  };

  for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (arg === '-b')
      config.bail = true;

    if (arg === '-n') {
      config.testName = process.argv[i + 1];
      i++;
    }
  }

  return config;
}

async function runTest(tmpdir, test) {
  const {name, desc} = test;
  let setup = test.setup;

  console.log(`Testing ${name}: ${desc}`);
  // prepare directory
  const testdir = path.join(tmpdir, name);
  const cdir = path.join(testdir, 'c');
  const jsdir = path.join(testdir, 'js');
  const njsdir = path.join(testdir, 'njs');

  await fs.mkdirp(cdir);
  await fs.mkdirp(jsdir);
  await fs.mkdirp(njsdir);

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

  cmd = getNJSCmd(name);
  try {
    console.log(`  Running nurkel version for: ${name}.`);
    res = await exec(cmd, njsdir);

    if (res.length !== 0)
      console.log(res);
  } catch (e) {
    throw new TestError(e.message, 'nurkel', name, e.code);
  }

  // run Checker
  cmd = getCheckCmd(name);
  try {
    console.log(`  Running check for: ${name}...`);
    res = await exec(`${cmd} ${cdir} ${jsdir} ${njsdir}`, testdir);

    if (res.length !== 0)
      console.log(res);
  } catch (e) {
    throw new TestError(e.message, 'check', name, e.code);
  }
}

function logError(tmpdir, e) {
  console.error('');
  console.error(`Test directory: ${tmpdir}`);
  console.error(`Test: ${e.name}`);
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
    case 'nurkel': {
      console.error(
        `Failed nurkel test run for: ${e.name}, exit code: ${e.code}`
      );
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
}

const tmpdir = getTmpDir();

(async () => {
  const cfg = simpleArgs();
  const errors = [];

  console.log(`Running checks in ${tmpdir}`);

  for (const test of tests) {
    if (cfg.testName && test.name !== cfg.testName)
      continue;

    try {
      await runTest(tmpdir, test);
    } catch (e) {
      if (cfg.bail)
        throw e;

      errors.push(e);
    }
  }

  if (errors.length) {
    for (const error of errors)
      logError(tmpdir, error);
    process.exit(1);
  }

  console.log(`Cleaning up ${tmpdir}...`);
  await fs.rimraf(tmpdir);
})().catch((e) => {
  logError(tmpdir, e);
  process.exit(1);
});
