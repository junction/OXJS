SRC =	core.js error.js base.js util.js uri.js settings.js 	\
	connection_adapter.js uri.js item.js	\
	mixins/call_dialog.js mixins/entity_time.js mixins/subscribable.js	\
	services/active_calls.js services/auth.js \
	services/directories.js services/preferences.js services/recent_calls.js	\
	services/rosters.js services/user_agents.js services/voicemail.js	\
	connection.js xml.js strophe_adapter.js

DOCDIR = ../doc

JSDOCDIR = ../frameworks/jsdoc-toolkit
TEMPLATE = $(JSDOCDIR)/templates/ox

JAVA =	java

all:	src doc

src:	ox.js jslint

jslint:
	../frameworks/jslint/jslint ../ox.js

doc:	$(DOCDIR)/index.html

ox.js:	Makefile $(SRC)
	cat $(SRC) > ../$@

$(DOCDIR)/index.html: Makefile $(SRC)
	$(JAVA) -jar $(JSDOCDIR)/jsrun.jar $(JSDOCDIR)/app/run.js -a -p -t=$(TEMPLATE) -d=$(DOCDIR) $(SRC)

clean-doc:
	rm -rf $(DOCDIR)

clean:
	rm -f ox.js
