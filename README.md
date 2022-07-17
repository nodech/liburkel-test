Liburkel integration tests
==========================

### Apply patches
There are some changes that have not been backported to the upstream.
So we need to apply them. Make sure to run `npm install` before running
patch.

```
  $ ./scripts/patch.sh
```

### Build C parts
```
  $ mkdir build/
  $ cd build
  $ cmake ..
  $ cmake --build .
```

### Running tests
From the root of the project run:
```
  $ node test-runner.js
```
