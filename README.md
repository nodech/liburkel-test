Liburkel integration tests
==========================

## Clone, build and run tests
```
  git clone --recursive https://github.com/nodech/liburkel-test
  cd liburkel-test
  npm install
  ./scripts/patch.sh
  npm rebuild
  mkdir build
  cd build
  cmake ..
  cmake --build .
  cd ..
  node test-runner.js
```
