#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <inttypes.h>
#include <urkel.h>

int main() {
  uint8_t key[32];
  uint8_t val[4] = {0x01, 0x01, 0x01, 0x01};
  urkel_t *db;
  urkel_tx_t *tx;

  urkel_hash(key, "\x01\x01\x01\x01", 4);

  db = urkel_open("./tree");
  assert(db != NULL);

  tx = urkel_tx_create(db, NULL);
  assert(tx != NULL);

  assert(urkel_tx_insert(tx, key, val, sizeof(val)));
  assert(urkel_tx_commit(tx));

  urkel_tx_destroy(tx);
  urkel_close(db);
  return 0;
}
