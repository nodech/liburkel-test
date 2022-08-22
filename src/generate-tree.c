#include <sys/stat.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <stdio.h>
#include <urkel.h>

int main(int argc, char **argv) {
  size_t target_size = 0;
  size_t size = 0;
  unsigned char meta[32];
  struct stat fstat = {0};
  urkel_t *db;
  urkel_tx_t *tx;
  char *path, *path_file, *path_meta;
  size_t path_len;
  FILE *meta_fd;

  memset(meta, 0x89, 32);

  assert(argc == 3);
  target_size = atoi(argv[2]);
  assert(target_size < 0x1ff000);
  path = argv[1];
  path_len = strlen(path);
  path_file = malloc(path_len + 12);
  path_meta = malloc(path_len + 6);

  strcpy(path_file, path);
  strcpy(path_meta, path);
  strcpy(&path_file[path_len], "/0000000001");
  strcpy(&path_meta[path_len], "/meta");


  urkel_destroy(path);
  db = urkel_open(path);
  assert(db != NULL);
  urkel_close(db);
  db = NULL;

  meta_fd = fopen(path_meta, "w");
  fwrite(meta, 1, 32, meta_fd);
  fclose(meta_fd);

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
