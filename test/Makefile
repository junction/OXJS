RHINODOMDIR = ../frameworks/rhinodom

JAVA =	java
RHINODIR = $(HOME)/src/rhino1_7R1/build

.PHONY:	rhinodom test

test:
	$(JAVA) -cp $(RHINODIR)/classes:$(RHINODOMDIR)/build Shell rhino.js

clean:
	cd rhinodom && ant -Drhino.dir=$(RHINODIR) clean
