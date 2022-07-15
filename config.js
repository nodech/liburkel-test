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
  }
];
