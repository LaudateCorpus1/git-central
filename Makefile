## Tasks

run: build
	tc-builder run

preRelease: build
	PRERELEASE=true tc-builder run

test: run

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
