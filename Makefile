## Tasks

run: build www
	webpack -w & electron .

webpack:
	webpack -w

test: build
	tc-builder run

## Dependencies

build: clean
	tc-builder compile

clean: FORCE
	rm -rf build

www:
	cp src/main/front-end/index.html build/main/index.html

info:
	node --version
	npm --version
	tsc --version
	typedoc --version

FORCE:
