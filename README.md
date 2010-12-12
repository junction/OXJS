OnSIP XMPP JavaScript
=====================

The OnSIP XMPP Javascript library (OXJS) is a fully functional
implementation of the OnSIP XMPP-API.  The my.onsip.com interface
utilizes OXJS on top of strophe for it's XMPP & XMPP-API connectivity.

Getting Started
---------------
The only requirement is having [V8](http://code.google.com/p/v8/) or [SpiderMonkey](http://www.mozilla.org/js/spidermonkey/) installed for JSLint cheking in the build process. They are not required to make the project, although they're recommended if you are contributing to the project.

    make src
    make doc

Overview
--------
This library is NOT a client side BOSH implementation. Instead, it wraps a BOSH connection to facilitate the process of subscribing to the OnSIP XMPP pubsub services and making the OnSIP specific adhoc command calls.


      +-------------------------------------+
      |       Client Side Web Browser       |
      |                                     |
      |   +----------------------------+    |
      |   |                            |    |
      |   |  Application Javascript    |    |
      |   |                            |    |
      |   +----------------------------+    |
      |           ^             ^           |
      |           |             |           |
      |         OnSIP           |           |
      |    XMPP API calls       |           |
      |           |          standard       |
      |           |        RFC 3920/3921    |
      |           v         & XEP XMPP      |
      |   +--------------+   messaging      |
      |   |              |      |           |
      |   |     OXJS     |      |           |
      |   |              |      v           |
      |   +----------------------------+    |
      |   |                            |    |
      |   |   JS XMPP Client Library   |    |
      |   |     (strophe/jsjac)        |    |
      |   +----------------------------+    |
      |                 ^                   |
      +---------------- | ------------------+
                        |
                        |
                    BOSH/HTTP(s)
      http://xmpp.org/extensions/xep-0124.html
                        |
                        |
                        v
          +----------------------------+
          |                            |
          |        XMPP Server         |
          |       (my.onsip.com)       |
          +----------------------------+

Tests
-----
You're probably just best off reading the tests to get an idea of how to use this library. You can open test/index.html in any browser to run the unit tests.

Ignore 'make test', it's incomplete as is.

Examples
--------
For the examples to work properly they must be served from same domain as the bosh resource they are trying to connect to in order to avoid cross domain issues. If you're using Apache, this means adding:

    ProxyPass /http-bind http://location/to/your/bosh/http-bind
    ProxyPassReverse /http-bind http://location/to/your/bosh/http-bind

to your .conf file, and restarting Apache. If you go to http://localhost/http-bind, you should see something like "You really don't look like a BOSH client to me... what do you want?". Now, start up the example on your localhost, and check it out!
