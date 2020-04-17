TSC = ./node_modules/typescript/bin/tsc

default: build

build:
	$(TSC) -i -p ./src

build-test: build
	$(TSC) -i -p ./test

build-tools:
	$(TSC) -i -p ./tools

start: build
	node -r source-map-support/register ./build/src/main

test: build-test
	NODE_DEBUG=test node -r source-map-support/register ./build/test/test/main $(ARGS)

what: build-tools
	node -r source-map-support/register ./build/tools/what-is-it
