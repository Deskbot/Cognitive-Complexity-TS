# build

build:
	npx tsc -i

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

test: build

what: build-tools

# npm

prepublishOnly: build build-ui build-test
