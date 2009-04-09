SRC =	core.js error.js base.js connection-adapter.js uri.js mixins.js	\
	item.js services.js connection.js xml.js

DOCDIR = ../doc

JSDOCDIR = ../frameworks/jsdoc-toolkit
TEMPLATE = $(JSDOCDIR)/templates/jsdoc

JAVA =	java

all:	src doc

src:	ox.js

doc:	$(DOCDIR)/index.html

ox.js:	Makefile $(SRC)
	cat $(SRC) > ../$@

$(DOCDIR)/index.html: Makefile $(SRC)
	$(JAVA) -jar $(JSDOCDIR)/jsrun.jar $(JSDOCDIR)/app/run.js -a -p -t=$(TEMPLATE) -d=$(DOCDIR) $(SRC)

clean-doc:
	rm -rf $(DOCDIR)

clean:
	rm -f ox.js
