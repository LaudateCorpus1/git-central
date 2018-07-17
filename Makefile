## Tasks

run: build
	electron .

test: build
	tc-builder run

## Dependencies

build: clean
	tc-builder compile

clean: FORCE
	rm -rf build

info:
	node --version
	npm --version
	tsc --version
	typedoc --version

FORCE:
