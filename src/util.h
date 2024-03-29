#ifndef _URKEL_INTEGRATION_UTIL_H
#define _URKEL_INTEGRATION_UTIL_H

#include <stdint.h>

int32_t
random_stuff(int32_t *seed);

uint8_t
random_stuff_byte(int32_t *seed);

uint8_t *
write32(uint8_t *dst, uint32_t word);

int
fs_rename(const char *oldpath, const char *newpath);

#endif /* _URKEL_INTEGRATION_UTIL_H */
