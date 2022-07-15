#include <inttypes.h>
#include <stdio.h>

/* This algorithm is mentioned in the ISO C standard, here extended
   for 32 bits.  */
int32_t
random_stuff(int32_t *seed) {
  int32_t next = *seed;
  int32_t result;

  next *= 1103515245;
  next += 12345;
  result = (int32_t) (next / 65536) % 2048;

  next *= 1103515245;
  next += 12345;
  result <<= 10;
  result ^= (int32_t) (next / 65536) % 1024;

  next *= 1103515245;
  next += 12345;
  result <<= 10;
  result ^= (int32_t) (next / 65536) % 1024;

  *seed = next;

  return result;
}

uint8_t
random_stuff_byte(int32_t *seed) {
  return random_stuff(seed) & 0xff;
}

uint8_t *
write32(uint8_t *dst, uint32_t word) {
  dst[0] = word >>  0;
  dst[1] = word >>  8;
  dst[2] = word >> 16;
  dst[3] = word >> 24;
  return dst + 4;
}
