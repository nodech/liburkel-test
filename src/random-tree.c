
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <stdint.h>
#include <urkel.h>
#include <stdio.h>

#include "util.h"

#define MAX_ITER 80

#define OP_COMMIT 1
#define OP_INSERT 2
#define OP_REVERT 3

void
rand_bytes(int32_t *seed, uint8_t *data, uint8_t n) {
  int i;
  for (i = 0; i < n; i++)
    data[i] = random_stuff_byte(seed);
}

void
rand_key(int32_t *seed, uint8_t *hash) {
  uint8_t key_size = random_stuff_byte(seed);
  uint8_t key[256];
  rand_bytes(seed, key, key_size);
  urkel_hash(hash, key, key_size);
}

void
rand_value(int32_t *seed, uint8_t *value, uint8_t *size) {
  uint8_t vsize = random_stuff_byte(seed);

  rand_bytes(seed, value, vsize);
  *size = vsize;
}

uint8_t
get_decision(int32_t *seed) {
  uint8_t byte = random_stuff_byte(seed);

  /* around 10 % */
  if (byte <= 25)
    return OP_COMMIT;

  /* [> around 5 % <] */
  /* if (byte <= 38) */
  /*   return OP_REVERT; */

  /* around 85 % */
  return OP_INSERT;
}

void
run(int32_t *seed) {
  urkel_t *db;
  urkel_tx_t *tx;

  /* uint32_t root_len = 0; */
  /* uint8_t roots[MAX_ITER][4]; */
  int i;

  db = urkel_open("./tree");
  assert(db != NULL);

  tx = urkel_tx_create(db, NULL);
  assert(tx != NULL);

  for (i = 0; i < MAX_ITER; i++) {
    uint8_t decision = get_decision(seed);

    switch (decision) {
      case OP_INSERT: {
        uint8_t key_hash[32] = {0};
        uint8_t value[256];
        uint8_t val_size = 0;

        rand_key(seed, key_hash);
        rand_value(seed, value, &val_size);
        assert(urkel_tx_insert(tx, key_hash, value, val_size));

        break;
      }
      case OP_COMMIT: {
        assert(urkel_tx_commit(tx));
        urkel_tx_destroy(tx);
        tx = urkel_tx_create(db, NULL);
        assert(tx != NULL);
        break;
      }
      /* case OP_REVERT: { */
      /*   break; */
      /* } */
      default: {
        assert(0);
      }
    }
  }

  assert(urkel_tx_commit(tx));
  urkel_tx_destroy(tx);
  urkel_close(db);
}

int main(int argc, char **argv) {
  int32_t seed = 2022;

  if (argc > 1)
    seed = atoi(argv[1]);

  run(&seed);

  return 0;
}
