SHELL = /bin/sh

.PHONY: doc clean-doc

all: doc

clean: clean-doc

doc:
	@echo "--> $(MAKE) $(MFLAGS) $@"
	@($(MAKE) -C doc doc)

clean-doc:
	@echo "--> $(MAKE) $(MFLAGS) $@"
	@($(MAKE) -C doc clean)
