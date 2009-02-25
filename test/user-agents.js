OXTest.UserAgents = new YAHOO.tool.TestCase({
  name: 'UserAgents Tests',

  setUp: function () {
    this.conn = {};
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initServices();
    this.UserAgents = this.ox.UserAgents;
  },

  tearDown: function () {
    delete this.ox;
    delete this.UserAgents;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.UserAgents,      'UserAgents mixin is not available');
    Assert.isObject(this.ox.UserAgents, 'UserAgents is not initialized');
    Assert.areSame(this.conn,           this.ox.UserAgents.connection);
  }
});

YAHOO.tool.TestRunner.add(OXTest.UserAgents);
