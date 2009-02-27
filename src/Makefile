SRC =	core.js base.js connection-adapter.js uri.js connection.js	\
	mixins.js item.js services.js xml.js

all: ox.js

ox.js:	Makefile $(SRC)
	cat $(SRC) > $@

clean:
	rm -f ox.js
