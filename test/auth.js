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

  testAuthPlain: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.Auth.authorizePlain,
                      'Plaintext auth function not available.');
  },

  testAuthPlainWithoutJID: function () {
    var Assert = YAHOO.util.Assert;

    this.Auth.authorizePlain('odysseus@sip-example.com', 'password');

    Assert.isCommand(this.conn._data, 'commands.auth.xmpp.onsip.com',
                     'authorize-plain',
                     {'sip-address': 'odysseus@sip-example.com',
                      'password':    'password',
                      'jid':         undefined,
                      'auth-for-all': 'false'});
  },

  testAuthPlainWithJID: function () {
    var Assert = YAHOO.util.Assert;

    this.Auth.authorizePlain('odysseus@sip-example.com', 'password',
                             'odysseus@jid-example.com');

    Assert.isCommand(this.conn._data, 'commands.auth.xmpp.onsip.com',
                     'authorize-plain',
                     {'sip-address': 'odysseus@sip-example.com',
                      'password':    'password',
                      'jid':         'odysseus@jid-example.com',
                      'auth-for-all': 'false'});
  },

  testAuthPlainWithAuthenticateForAll: function () {
    var Assert = YAHOO.util.Assert;

    this.Auth.authorizePlain('odysseus@sip-example.com',
                             'password',
                             'odysseus@jid-example.com',
                             true);

    Assert.isCommand(this.conn._data, 'commands.auth.xmpp.onsip.com',
                     'authorize-plain',
                     {'sip-address': 'odysseus@sip-example.com',
                      'password':    'password',
                      'jid':         'odysseus@jid-example.com',
                      'auth-for-all': 'true'});
  },

  testAuthPlainCallbacks: function () {
    var Assert = YAHOO.util.Assert;

    this.Auth.authorizePlain('odysseus@sip-example.com', 'password', {
      onSuccess: function() {},
      onError: function() {}
    });

    Assert.isCommand(this.conn._data, 'commands.auth.xmpp.onsip.com',
                     'authorize-plain',
                     {'sip-address': 'odysseus@sip-example.com',
                      'password':    'password',
                      'jid':         undefined,
                      'auth-for-all': 'false'});
  },


  testAuthPlainSuccess: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="commands.auth.xmpp.onsip.com" to="mock@example.com" id="test" type="result"><command xmlns="http://jabber.org/protocol/commands" status="completed" node="authorize-plain" sessionid="session-id"><note type="info">JID \'alice@example.com\' has been authorized to access resources for SIP Address \'alice@example.com\'</note><x xmlns="jabber:x:data" type="result"><field type="fixed" var="expires"><value>2009-02-19T21:08:38Z</value></field>'
                                                      + '<field type="fixed" var="sip" >'
                                                      + '<value>alice@example.com</value>'
                                                      + '</field></x></command></iq>'));

    var successFlag = false, errorFlag = false;
    this.Auth.authorizePlain('alice@example.com', 'password', {
      onSuccess: function (packet) {
        successFlag = true;
        Assert.isObject(packet, 'Packet should be an object');
      },
      onError:   function () { errorFlag   = true; }
    });

    Assert.isFalse(errorFlag, 'Got error trying to auth plain.');
    Assert.isTrue(successFlag, 'Was not successful trying to auth plain.');
  },

  // implemented to fix a bug found on 11/4/10
  testAuthPlainSuccessWithNoOnErrorCallback: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="commands.auth.xmpp.onsip.com" to="mock@example.com" id="test" type="result"><command xmlns="http://jabber.org/protocol/commands" status="completed" node="authorize-plain" sessionid="session-id"><note type="info">JID \'alice@example.com\' has been authorized to access resources for SIP Address \'alice@example.com\'</note><x xmlns="jabber:x:data" type="result"><field type="fixed" var="expires"><value>2009-02-19T21:08:38Z</value></field>'
                                                      + '<field type="fixed" var="sip" >'
                                                      + '<value>alice@example.com</value>'
                                                      + '</field></x></command></iq>'));

    var successFlag = false;
    this.Auth.authorizePlain('alice@example.com', 'password', {
      onSuccess: function (packet) {
        successFlag = true;
        Assert.isObject(packet, 'Packet should be an object');
      }
    });

    Assert.isTrue(successFlag, 'Was not successful trying to auth plain.');
  },

  testAuthPlainSuccessWithMultipleAuthorizations: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="commands.auth.xmpp.onsip.com" to="mock@example.com" id="test" type="result"><command xmlns="http://jabber.org/protocol/commands" status="completed" node="authorize-plain" sessionid="session-id"><note type="info">JID \'alice@example.com\' has been authorized to access resources for SIP Address \'alice@example.com\'</note><x xmlns="jabber:x:data" type="result"><field type="fixed" var="expires"><value>2009-02-19T21:08:38Z</value></field>'
                                                      + '<field type="fixed" var="sip" >'
                                                      + '<value>alice@example.com</value>'
                                                      + '</field>'
                                                      + '<field type="fixed" var="sip" >'
                                                      + '<value>alice.other@example.com</value>'
                                                      + '</field></x></command></iq>'));

    var isObject = false, successFlag = false, errorFlag = false;
    this.Auth.authorizePlain('alice@example.com', 'password', null, true, {
      onSuccess: function (packet) {
        successFlag = true;
        Assert.isObject(packet, 'Packet should be an object');
      },
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
  },

  testAuthEntityTime: function() {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.Auth.entityTime,
                      'auth entity time function not available.');

    this.conn.addResponse(OXTest.Packet.extendWithXML("<iq type='result'"
                                                      + "    from='juliet@capulet.com/balcony'"
                                                      + "    to='romeo@montague.net/orchard'"
                                                      + "    id='time_1'>"
                                                      + "  <time xmlns='urn:xmpp:time'>"
                                                      + "    <tzo>-06:00</tzo>"
                                                      + "    <utc>2006-12-19T17:58:35Z</utc>"
                                                      + "  </time>"
                                                      + "</iq>"));

    var successful = false, errorFlag = false, tzo, utc;

    this.Auth.entityTime({
      onSuccess: function(packet, time) {
        tzo = time.tzo;
        utc = time.utc;
        successFlag = true;
      },
      onError: function() { errorFlag = true; }
    });

    Assert.isFalse(errorFlag, 'error flag should be false');
    Assert.isTrue(successFlag, 'success flag should be true');

    Assert.areEqual('-06:00', tzo, 'tzo is wrong');
    Assert.areEqual('2006-12-19T17:58:35Z', utc, 'utc is wrong');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Auth);
