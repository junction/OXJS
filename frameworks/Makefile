RHINODIR = $(HOME)/src/rhino1_7R1/build

.PHONY:	rhinodom

all:	rhinodom

rhinodom:
	cd rhinodom && ant -Drhino.dir=$(RHINODIR) dist

clean:
	cd rhinodom && ant -Drhino.dir=$(RHINODIR) clean
