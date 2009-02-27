OXTest.Auth = new YAHOO.tool.TestCase({
  name: 'Auth Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();

    this.Auth = this.ox.Auth;
  },

  tearDown: function () {
    delete this.ox;
    delete this.Auth;
    delete this.conn;
    delete this.DOMParser;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Auth,   'Auth mixin is not available');
    Assert.isObject(this.Auth, 'Auth mixin is not initialized');
    Assert.areSame(this.conn,  this.ox.Auth.connection);
  },

  testAuthorizePlainWithoutJID: function () {
    var Assert = YAHOO.util.Assert;

    this.Auth.authenticatePlain('enoch@sip-example.com', 'example');

    var doc = OXTest.DOMParser.parse(this.conn._data);

    window.bjc1 = doc;

    Assert.areSame('set',
                   doc.getPathValue('/iq/@type'),
                   'auth-plain iq is not type set.');
    Assert.areSame('commands.auth.xmpp.onsip.com',
                   doc.getPathValue('/iq/@to'),
                   'auth-plain command is not sent to auth commands host.');
    Assert.areSame('authenticate-plain',
                   doc.getPathValue('/iq/cmd:command/@node'),
                   'auth-plain command node is not authenticate-plain.');
    Assert.areSame('submit',
                   doc.getPathValue('/iq/cmd:command/x:x/@type'),
                   'auth-plain xform type is not submit.');
    Assert.areSame('enoch@sip-example.com',
                   doc.getPathValue('/iq/cmd:command/x:x/x:field[@var="sip-address"]/x:value/text()'),
                   'auth-plain xform sip-address is wrong.');
    Assert.areSame('example',
                   doc.getPathValue('/iq/cmd:command/x:x/x:field[@var="password"]/x:value/text()'),
                   'auth-plain xform password is wrong.');
    Assert.areEqual(undefined,
                    doc.getPathValue('/iq/cmd:command/x:x/x:field[@var="jid"]/x:value/text()'),
                    'auth-plain xform jid is being set.');
  },

  testAuthorizePlainWithJID: function () {
    var Assert = YAHOO.util.Assert;

    window.bjc2 = doc;

    Assert.isFunction(this.Auth.authenticatePlain,
                      'Plaintext auth function not available.');
    this.Auth.authenticatePlain('enoch@sip-example.com', 'example',
                                'enoch@jid-example.com');

    var doc = OXTest.DOMParser.parse(this.conn._data);

    Assert.areSame('set',
                   doc.getPathValue('/iq/@type'),
                   'auth-plain iq is not type set.');
    Assert.areSame('commands.auth.xmpp.onsip.com',
                   doc.getPathValue('/iq/@to'),
                   'auth-plain command is not sent to auth commands host.');
    Assert.areSame('authenticate-plain',
                   doc.getPathValue('/iq/cmd:command/@node'),
                   'auth-plain command node is not authenticate-plain.');
    Assert.areSame('submit',
                   doc.getPathValue('/iq/cmd:command/x:x/@type'),
                   'auth-plain xform type is not submit.');
    Assert.areSame('enoch@sip-example.com',
                   doc.getPathValue('/iq/cmd:command/x:x/x:field[@var="sip-address"]/x:value/text()'),
                   'auth-plain xform sip-address is wrong.');
    Assert.areSame('example',
                   doc.getPathValue('/iq/cmd:command/x:x/x:field[@var="password"]/x:value/text()'),
                   'auth-plain xform password is wrong.');
    Assert.areSame('enoch@jid-example.com',
                   doc.getPathValue('/iq/cmd:command/x:x/x:field[@var="jid"]/x:value/text()'),
                   'auth-plain xform jid is wrong.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Auth);
