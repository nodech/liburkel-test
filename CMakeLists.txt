cmake_minimum_required(VERSION 3.10)
project(urkel-integration LANGUAGES C)

set(priv_options)
set(general_sources)
set(targets)

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

# Add liburkel
add_subdirectory(liburkel)

# List of tests
list(APPEND targets rand-test
  empty-tree-test
  single-root-tree-test
  ten-by-ten-test)

foreach (target IN LISTS targets)
  add_executable(${target} ${general_sources} src/${target}.c)
  target_compile_options(${target} PRIVATE ${priv_options})
  target_link_libraries(${target} PUBLIC urkel_static)
endforeach()
