#include <stdio.h>
#include <inttypes.h>

#include "util.h"

int main() {
  int32_t seed = 200;
  FILE *fd = fopen("rand", "w");

  int i;
  for (i = 0; i < 100000; i++)
    fprintf(fd, "%c", random_stuff_byte(&seed));

  fclose(fd);

  return 0;
}
