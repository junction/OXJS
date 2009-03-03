OXTest.Connection = new YAHOO.tool.TestCase({
  name: 'OX Connection Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
  },

  testServices: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(this.ox.ActiveCalls,
                    'Active calls instance service not an object.');
    Assert.isObject(this.ox.Auth,
                    'Auth instance service not an object.');
    Assert.isObject(this.ox.Directories,
                    'Directories instance service not an object.');
    Assert.isObject(this.ox.Preferences,
                    'Preferences instance service not an object.');
    Assert.isObject(this.ox.RecentCalls,
                    'Recent calls instance service not an object.');
    Assert.isObject(this.ox.UserAgents,
                    'User agents instance service not an object.');
    Assert.isObject(this.ox.Voicemail,
                    'Voicemail instance service not an object.');
  },

  testHandlers: function () {
    var Assert = YAHOO.util.Assert;

    var handlerFired = false;
    var handler = function (packet) {
      handlerFired = true;
      Assert.areSame('jill@example.com', packet.getFrom());
      Assert.areSame('jack@example.com', packet.getTo());
    };

    Assert.isFunction(this.ox.registerJIDHandler,
                      'registerJIDHandler is not a function.');

    this.ox.registerJIDHandler('jill@example.com', handler);

    var doc = OXTest.DOMParser.parse('<message from="jill@example.com" to="jill@example.com"><event xmlns="http://jabber.org/protocol/pubsub#event"><items node="musings"><item id="1"></item></items></event></message>');
    var packet = OXTest.Message.extend({from: 'jill@example.com',
                                        to:   'jack@example.com',
                                        doc:  doc});
    this.conn.fireEvent('message', packet);
    Assert.isTrue(handlerFired, 'JID event handler was not fired.');

    Assert.isFunction(this.ox.unregisterJIDHandler,
                      'unregisterJIDHandler is not a function.');
    handlerFired = false;
    this.ox.unregisterJIDHandler('jill@example.com');
    this.conn.fireEvent('message', packet);
    Assert.isFalse(handlerFired, 'JID event handler was fired after unregister.');
  },

  testIQSuccessCallback: function () {
    var Assert = YAHOO.util.Assert;

    var xml = '';
    var handlerFired = false;
    var handler = function (packet, arg2) {
      Assert.areSame('arg2', arg2);
    };

    Assert.areSame(0, 1, 'Check onSuccess callback.');
    this.ox.connection.send(xml, handler, 'arg2');
  },

  testIQErrorCallback: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame(0, 1, 'Check onError callback.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Connection);
