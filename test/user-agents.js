OXTest.UserAgents = new YAHOO.tool.TestCase({
  name: 'UserAgents Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();
    this.UserAgents = this.ox.UserAgents;
  },

  tearDown: function () {
    delete this.ox;
    delete this.UserAgents;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Services.UserAgents,
                    'UserAgents mixin is not available');
    Assert.isObject(this.ox.UserAgents, 'UserAgents is not initialized');
    Assert.areSame(this.conn,           this.ox.UserAgents.connection);
  },

  testItemFromPacket: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.UserAgents.itemFromPacket,
                      'User agent service cannot turn packet into item.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.UserAgents);
