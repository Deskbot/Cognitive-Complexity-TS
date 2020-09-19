# build

build:
	npx tsc -i -p ./src

build-test: build
	npx tsc -i -p ./test

build-tools:
	npx tsc -i -p ./tools

build-ui: build
	npx tsc -i -p ./ui

# entry points

json: build

ui: build build-ui

# dev tools

clean:
	rm -rf ./build

test: build-test

what: build-tools

# npm

prepublishOnly: build build-ui build-test
