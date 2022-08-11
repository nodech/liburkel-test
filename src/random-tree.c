
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <stdint.h>
#include <urkel.h>
#include <stdio.h>

#include "util.h"

#define MAX_ITER 40000
#define HASH_SIZE 32

#define OP_COMMIT 1
#define OP_INSERT 2
#define OP_REVERT 3

struct root_list {
  uint8_t roots[MAX_ITER][HASH_SIZE];
  uint32_t size;
};

struct key_list {
  uint8_t keys[MAX_ITER][HASH_SIZE];
  uint32_t size;
};

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

  /* around 5 % */
  if (byte <= 38)
    return OP_REVERT;

  /* around 85 % */
  return OP_INSERT;
}

void
run(int32_t *seed, FILE *fd) {
  urkel_t *db;
  urkel_tx_t *tx;

  int i;
  struct root_list *roots = malloc(sizeof(struct root_list));
  struct key_list *keys = malloc(sizeof(struct key_list));
  memset(roots, 0, sizeof(struct root_list));
  memset(keys, 0, sizeof(struct key_list));

  db = urkel_open("./tree");
  assert(db != NULL);

  tx = urkel_tx_create(db, NULL);
  assert(tx != NULL);

  for (i = 0; i < MAX_ITER; i++) {
    uint8_t decision = get_decision(seed);

    switch (decision) {
      case OP_INSERT: {
        uint8_t key_hash[HASH_SIZE] = {0};
        uint8_t value[256];
        uint8_t val_size = 0;

        rand_key(seed, key_hash);
        rand_value(seed, value, &val_size);
        assert(urkel_tx_insert(tx, key_hash, value, val_size));
        memcpy(keys->keys[keys->size], key_hash, HASH_SIZE);
        keys->size++;

        break;
      }
      case OP_COMMIT: {
        assert(urkel_tx_commit(tx));
        urkel_tx_destroy(tx);
        tx = urkel_tx_create(db, NULL);
        urkel_root(db, roots->roots[roots->size]);
        roots->size++;
        assert(tx != NULL);
        break;
      }
      case OP_REVERT: {
        uint8_t rnum;
        uint8_t *root;

        if (roots->size == 0)
          break;

        rnum = random_stuff_byte(seed);
        root = roots->roots[rnum % roots->size];
        urkel_inject(db, root);
        break;
      }
      default: {
        assert(0);
      }
    }

    {
      uint8_t *proof, *key, *root;
      uint8_t rnum;
      size_t proof_len;

      if (roots->size > 0 && keys->size > 0) {
        rnum = random_stuff_byte(seed);
        key = keys->keys[rnum % keys->size];
        rnum = random_stuff_byte(seed);
        root = roots->roots[rnum % roots->size];

        urkel_prove(db, &proof, &proof_len, key, root);
        fwrite(proof, 1, proof_len, fd);
      }
    }
  }

  assert(urkel_tx_commit(tx));
  urkel_tx_destroy(tx);
  urkel_close(db);
}

int main(int argc, char **argv) {
  FILE *fd;
  int32_t seed = 2022;

  if (argc > 1)
    seed = atoi(argv[1]);

  fd = fopen("./proofs", "w");
  assert(fd != NULL);

  run(&seed, fd);
  fclose(fd);

  return 0;
}
