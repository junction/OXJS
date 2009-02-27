SHELL = /bin/sh

.PHONY: src doc clean-doc

all: src doc

clean: clean-src clean-doc

src:
	@echo "--> $(MAKE) $(MFLAGS) $@"
	@($(MAKE) -C src all)

doc:	src
	@echo "--> $(MAKE) $(MFLAGS) $@"
	@($(MAKE) -C doc doc)

clean-src:
	@echo "--> $(MAKE) $(MFLAGS) $@"
	@($(MAKE) -C src clean)

clean-doc:
	@echo "--> $(MAKE) $(MFLAGS) $@"
	@($(MAKE) -C doc clean)
