JAVA =	java
RHINODIR = $(HOME)/src/rhino1_7R1/build

.PHONY:	rhinodom test

test:	rhinodom
	$(JAVA) -cp $(RHINODIR)/classes:rhinodom/build Shell rhino.js

rhinodom:
	cd rhinodom && ant -Drhino.dir=$(RHINODIR) dist

clean:
	cd rhinodom && ant -Drhino.dir=$(RHINODIR) clean
