'use strict';

/*
 * This configures tests to run C/JS and the checker.
 * We only need to provide names, it will look up
 * specific binary/js and checker by itself with the same name.
 *
 * For example: 'rand-test' expects 'build/rand-test' binary in the
 * tree root for C version. 'js/rand-test.js' for js version and
 * 'check/rand-test.js' for the checks.
 */

exports.tests = [
  {
    name: 'rand-test',
    desc: 'Random generator is the same.',
    setup: false
  },
  {
    name: 'empty-tree-test',
    desc: 'Empty tree is the same.',
    setup: false
  },
  {
    name: 'single-root-tree-test',
    desc: 'Insert single entry.'
  },
  {
    name: 'ten-by-ten-test',
    desc: 'Insert ten roots with ten entries each.'
  },
  {
    name: 'empty-commit',
    desc: 'Commit empty transaction.'
  },
  {
    name: 'empty-commit-2',
    desc: 'Commit empty transaction.'
  },
  {
    name: 'random-tree',
    desc: 'Generate random tree'
  },
  {
    name: 'ten-by-ten-compact-test',
    desc: 'Insert ten roots with ten entries and compact.'
  },
  {
    name: 'random-tree-compact',
    desc: 'Generate random tree and then compact.'
  },
  {
    name: 'inject-then-commit',
    desc: 'Create tx, inject and then commit.'
  },
  {
    name: 'inject-then-commit-newfile',
    desc: 'Create tx, inject and then commit on the edge of new file',
    setup: false,
    prep: ['generateTree', 2064464]
  }
];
