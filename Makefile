SHELL = /bin/sh

.PHONY: src test doc clean-src clean-test clean-doc

all: src doc

clean: clean-src clean-test clean-doc

src:
	@echo "--> $(MAKE) $(MFLAGS) $@"
	@($(MAKE) -C src all)

test:
	@echo "--> $(MAKE) $(MFLAGS) $@"
	@($(MAKE) -C test test)

doc:
	@echo "--> $(MAKE) $(MFLAGS) $@"
	@($(MAKE) -C src doc)

clean-src:
	@echo "--> $(MAKE) $(MFLAGS) $@"
	@($(MAKE) -C src clean)

clean-test:
	@echo "--> $(MAKE) $(MFLAGS) $@"
	@($(MAKE) -C test clean)

clean-doc:
	@echo "--> $(MAKE) $(MFLAGS) $@"
	@($(MAKE) -C src clean-doc)
