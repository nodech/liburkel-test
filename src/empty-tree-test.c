#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <urkel.h>

int main() {
  urkel_t *db;

  db = urkel_open("./tree");

  assert(db != NULL);

  urkel_close(db);
  return 0;
}
