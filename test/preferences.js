OXTest.Preferences = new YAHOO.tool.TestCase({
  name: 'Preferences Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();
    this.Preferences = this.ox.Preferences;
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
    delete this.Preferences;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Services.Preferences,
                    'Preferences mixin is not available');
    Assert.isObject(this.ox.Preferences, 'Preferences is not initialized');
    Assert.areSame(this.conn,            this.ox.Preferences.connection);
  },

  testItemFromPacket: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.Preferences.itemFromPacket,
                      'Preferences service cannot turn packet into item.');

    var itemXML = '';
    var packet = OXTest.Message.extend({
      from: 'user-agents.xmpp.onsip.com',
      to:   'me@example.com',
      doc:  OXTest.DOMParser.parse(itemXML)
    });
    var item = this.Preferences.itemFromPacket(packet);
    Assert.isObject(item, 'Preferences.itemFromPacket did not return an object.');
    Assert.areSame(this.conn, item.connection,
                   'Preferences item connection is wrong.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Preferences);
