OXTest.Auth = new YAHOO.tool.TestCase({
  name: 'Auth Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
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
    Assert.areSame(this.ox,    this.ox.Auth.connection);
  },

  testAuthorizePlainWithoutJID: function () {
    var Assert = YAHOO.util.Assert;

    this.Auth.authenticatePlain('enoch@sip-example.com', 'example');

    Assert.isCommand(this.conn._data, 'commands.auth.xmpp.onsip.com',
                     'authenticate-plain',
                     {'sip-address': 'enoch@sip-example.com',
                      'password':    'example',
                      'jid':         undefined});
  },

  testAuthorizePlainWithJID: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.Auth.authenticatePlain,
                      'Plaintext auth function not available.');
    this.Auth.authenticatePlain('enoch@sip-example.com', 'example',
                                'enoch@jid-example.com');

    Assert.isCommand(this.conn._data, 'commands.auth.xmpp.onsip.com',
                     'authenticate-plain',
                     {'sip-address': 'enoch@sip-example.com',
                      'password':    'example',
                      'jid':         'enoch@jid-example.com'});
  }
});

YAHOO.tool.TestRunner.add(OXTest.Auth);
