
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <stdint.h>
#include <urkel.h>

#include "util.h"

int main() {
  int k = 0;
  int i, j;
  uint8_t key[4], hash[32], val[4], fifth_root[32];
  urkel_t *db;
  urkel_tx_t *tx;

  db = urkel_open("./tree");
  assert(db != NULL);

  for (i = 0; i < 10; i++) {
    tx = urkel_tx_create(db, NULL);
    assert(tx != NULL);

    for (j = 0; j < 10; j++) {
      write32(key, k++);
      memcpy(val, key, 4);
      urkel_hash(hash, key, 4);
      assert(urkel_tx_insert(tx, hash, val, sizeof(val)));
    }
    assert(urkel_tx_commit(tx));
    urkel_tx_destroy(tx);

    if (i == 4)
      urkel_root(db, fifth_root);
  }

  tx = urkel_tx_create(db, NULL);
  assert(tx != NULL);

  for (i = 0; i < 10; i++) {
    write32(key, k++);
    memcpy(val, key, 4);
    urkel_hash(hash, key, 4);
    assert(urkel_tx_insert(tx, hash, val, sizeof(val)));
  }

  urkel_inject(db, fifth_root);
  assert(urkel_tx_commit(tx));
  urkel_tx_destroy(tx);

  urkel_close(db);
  return 0;
}
