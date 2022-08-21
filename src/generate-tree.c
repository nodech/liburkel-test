#include <sys/stat.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <urkel.h>

int main(int argc, char **argv) {
  size_t target_size = 0;
  size_t size = 0;
  struct stat fstat = {0};
  urkel_t *db;
  urkel_tx_t *tx;
  char *path, *path_file;
  size_t path_len;

  assert(argc == 3);
  target_size = atoi(argv[2]);
  assert(target_size < 0x1ff000);
  path = argv[1];
  path_len = strlen(path);
  path_file = malloc(path_len + 12);

  strcpy(path_file, path);
  strcpy(&path_file[path_len], "/0000000001");


  urkel_destroy(path);
  db = urkel_open(path);

  assert(db != NULL);

  while (size < target_size) {
    tx = urkel_tx_create(db, NULL);
    urkel_tx_commit(tx);
    stat(path_file, &fstat);

    size = fstat.st_size;
  }

  urkel_close(db);
  return 0;
}
