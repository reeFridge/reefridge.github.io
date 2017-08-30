#!/usr/bin/bash

rm -rf ./build
java -jar ./gcc/closure-compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --js ./js/src/main.js --js_output_file ./js/main.js
cobalt build
cobalt import -b master
git checkout master
git push origin master

git checkout source
