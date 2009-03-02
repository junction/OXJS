OXTest.RecentCalls = new YAHOO.tool.TestCase({
  name: 'RecentCalls Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();
    this.RecentCalls = this.ox.RecentCalls;
  },

  tearDown: function () {
    delete this.ox;
    delete this.RecentCalls;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Services.RecentCalls,
                    'RecentCalls mixin is not available');
    Assert.isObject(this.ox.RecentCalls, 'RecentCalls is not initialized');
    Assert.areSame(this.conn,            this.ox.RecentCalls.connection);
  },

  testItemFromPacket: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.RecentCalls.itemFromPacket,
                      'Recent call service cannot turn packet into item.');

    var itemXML = '';
    var packet = OXTest.Message.extend({
      from: 'user-agents.xmpp.onsip.com',
      to:   'me@example.com',
      doc:  OXTest.DOMParser.parse(itemXML)
    });
    var item = this.RecentCalls.itemFromPacket(packet);
    Assert.isObject(item, 'RecentCalls.itemFromPacket did not return an object.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.RecentCalls);
