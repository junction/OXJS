OXTest.Services = new YAHOO.tool.TestCase({
  name: 'OX Service Tests',

  setUp: function () {
    this.conn = {};
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initServices();
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
  },

  testServiceMixins: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Auth,        'Auth mixin is not available');
    Assert.isObject(OX.ActiveCalls, 'ActiveCalls mixin is not available');
    Assert.isObject(OX.UserAgents,  'UserAgents mixin is not available');
    Assert.isObject(OX.Voicemail,   'Voicemail mixin is not available');
    Assert.isObject(OX.Directories, 'Directories mixin is not available');
    Assert.isObject(OX.Preferences, 'Preferences mixin is not available');
    Assert.isObject(OX.RecentCalls, 'RecentCalls mixin is not available');
  },

  testServices: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(this.ox.Auth,        'Auth mixin is not initialized');
    Assert.isObject(this.ox.ActiveCalls, 'ActiveCalls is not initialized');
    Assert.isObject(this.ox.UserAgents,  'UserAgents is not initialized');
    Assert.isObject(this.ox.Voicemail,   'Voicemail is not initialized');
    Assert.isObject(this.ox.Directories, 'Directories is not initialized');
    Assert.isObject(this.ox.Preferences, 'Preferences is not initialized');
    Assert.isObject(this.ox.RecentCalls, 'RecentCalls is not initialized');
  },

  testInheritance: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame(this.conn, this.ox.Auth.connection);
    Assert.areSame(this.conn, this.ox.ActiveCalls.connection);
    Assert.areSame(this.conn, this.ox.UserAgents.connection);
    Assert.areSame(this.conn, this.ox.Voicemail.connection);
    Assert.areSame(this.conn, this.ox.Directories.connection);
    Assert.areSame(this.conn, this.ox.Preferences.connection);
    Assert.areSame(this.conn, this.ox.RecentCalls.connection);
  }
});

YAHOO.tool.TestRunner.add(OXTest.Services);
