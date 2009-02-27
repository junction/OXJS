OXTest.RecentCalls = new YAHOO.tool.TestCase({
  name: 'RecentCalls Tests',

  setUp: function () {
    this.conn = {};
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
  }
});

YAHOO.tool.TestRunner.add(OXTest.RecentCalls);
