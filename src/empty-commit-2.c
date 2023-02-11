#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <stdint.h>
#include <urkel.h>

#include "util.h"

int main() {
  int i;
  urkel_t *db;
  urkel_tx_t *tx;

  db = urkel_open("./tree");
  assert(db != NULL);

  for (i = 0; i < 20; i++) {
    tx = urkel_tx_create(db, NULL);
    assert(tx != NULL);
    assert(urkel_tx_commit(tx));
    urkel_tx_destroy(tx);
  }

  /* one last empty commit. */
  tx = urkel_tx_create(db, NULL);
  assert(tx != NULL);
  assert(urkel_tx_commit(tx));
  urkel_tx_destroy(tx);

  urkel_close(db);
  return 0;
}
