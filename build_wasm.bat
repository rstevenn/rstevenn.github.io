emcc core_alg.c -o core_alg.js -s NO_EXIT_RUNTIME=1 -s EXPORTED_RUNTIME_METHODS="[ccall, cwrap]" -sALLOW_MEMORY_GROWTH -sEXPORTED_FUNCTIONS="[_malloc, _free, _main]" 