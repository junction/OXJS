OXTest.Auth = new YAHOO.tool.TestCase({
  name: 'Auth Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend().init();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();

    this.Auth = this.ox.Auth;
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Services.Auth,
                    'Auth mixin is not available');
    Assert.isObject(this.Auth, 'Auth mixin is not initialized');
    Assert.areSame(this.ox, this.ox.Auth.connection);
  },

  testCommandURIs: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(this.Auth.commandURIs,
                    'Auth.commandURIs is not an object.');
    Assert.areSame('xmpp:commands.auth.xmpp.onsip.com?;node=authorize-plain',
                   this.Auth.commandURIs.authorizePlain,
                   'Auth.commandURIs.transfer is wrong');
  },

  testAuthPlain: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.Auth.authorizePlain,
                      'Plaintext auth function not available.');
  },

  testAuthPlainWithoutJID: function () {
    var Assert = YAHOO.util.Assert;

    this.Auth.authorizePlain('enoch@sip-example.com', 'example');

    Assert.isCommand(this.conn._data, 'commands.auth.xmpp.onsip.com',
                     'authorize-plain',
                     {'sip-address': 'enoch@sip-example.com',
                      'password':    'example',
                      'jid':         undefined});
  },

  testAuthPlainWithJID: function () {
    var Assert = YAHOO.util.Assert;

    this.Auth.authorizePlain('enoch@sip-example.com', 'example',
                             'enoch@jid-example.com');

    Assert.isCommand(this.conn._data, 'commands.auth.xmpp.onsip.com',
                     'authorize-plain',
                     {'sip-address': 'enoch@sip-example.com',
                      'password':    'example',
                      'jid':         'enoch@jid-example.com'});
  },

  testAuthPlainSuccess: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="commands.auth.xmpp.onsip.com" to="mock@example.com" id="test" type="result"><command xmlns="http://jabber.org/protocol/commands" status="completed" node="authorize-plain" sessionid="session-id"><note type="info">JID \'alice@example.com\' has been authorized to access resources for SIP Address \'alice@example.com\'</note><x xmlns="jabber:x:data" type="result"><field type="fixed" var="expires"><value>2009-02-19T21:08:38Z</value></field></x></command></iq>'));

    var successFlag = false, errorFlag = false;
    this.Auth.authorizePlain('alice@example.com', 'password', {
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });

    Assert.isFalse(errorFlag, 'Got error trying to auth plain.');
    Assert.isTrue(successFlag, 'Was not successful trying to auth plain.');
  },

  testAuthPlainError: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="commands.auth.xmpp.onsip.com" type="error" xml:lang="en" to="mock@example.com" id="test"><command xmlns="http://jabber.org/protocol/commands" node="authorize-plain" sessionid="session-id"><x xmlns="jabber:x:data" type="submit"><field type="text-single" var="sip-address"><value>alice@example.com</value></field><field type="text-private" var="password"><value>password</value></field><field type="hidden" var="jid" /></x></command><error type="modify" code="400"><bad-request xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/><text xmlns="urn:ietf:params:xml:ns:xmpp-stanzas">Execution Errors; base Authentication failed - invalid username or password.; missing response</text><bad-action xmlns="http://jabber.org/protocol/commands"/></error></iq>'));

    var successFlag = false, errorFlag = false;
    this.Auth.authorizePlain('alice@example.com', 'password', {
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });

    Assert.isFalse(successFlag, 'Was successful trying to auth plain.');
    Assert.isTrue(errorFlag, 'Did not get error trying to auth plain.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Auth);
