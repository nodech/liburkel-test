cmake_minimum_required(VERSION 3.10)
project(urkel-integration LANGUAGES C)

set(priv_options)
set(general_sources)

if (CMAKE_C_COMPILER_ID MATCHES "GNU|Clang|AppleClang")
  list(APPEND priv_options -pedantic
    -Wall
    -Wextra
    -Wcast-align
    -Wno-implicit-fallthrough
    -Wno-long-long
    -Wno-overlength-strings
    -Wshadow)
endif()

set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS off)
set(CMAKE_C_STANDARD 90)

list(APPEND general_sources src/util.c)

add_executable(rand-test ${general_sources} src/rand-test.c)

# config compiler
target_compile_options(rand-test PRIVATE ${priv_options})
