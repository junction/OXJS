OXTest.Preferences = new YAHOO.tool.TestCase({
  name: 'Preferences Tests',

  setUp: function () {
    this.conn = {};
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initServices();
    this.Preferences = this.ox.Preferences;
  },

  tearDown: function () {
    delete this.ox;
    delete this.Preferences;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Preferences,      'Preferences mixin is not available');
    Assert.isObject(this.ox.Preferences, 'Preferences is not initialized');
    Assert.areSame(this.conn,            this.ox.Preferences.connection);
  }
});

YAHOO.tool.TestRunner.add(OXTest.Preferences);
