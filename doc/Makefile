JAVA =	/usr/bin/java

DOCDIR = ox-doc
SRCDIR = ../src/ox.js

jsdoc_dir = jsdoc-toolkit
jsdoc_tpl = templates/jsdoc

.PHONY: doc clean

doc:
	cd $(jsdoc_dir); $(JAVA) -jar jsrun.jar app/run.js -a -p -t=$(jsdoc_tpl) -d=../$(DOCDIR) ../$(SRCDIR)

clean:
	rm -rf $(DOCDIR)
