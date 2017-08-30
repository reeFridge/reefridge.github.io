#!/usr/bin/bash

BUILD_DIR=./build

if [ -d "$BUILD_DIR" ]; then
	echo -e "[build]\tCleanup ./build dir";
	rm -rf $BUILD_DIR;
fi
echo -e "[build]\tCompiling js sources"
java -jar ./gcc/closure-compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --js ./js/src/main.js --js_output_file ./js/main.js
cobalt build
echo -e "[build]\tDone\n"

# Deploy
echo -e "To deploy build to gh-pages run:\n
> cobalt import -b master
> git checkout master
> git push origin master"

