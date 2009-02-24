/* Namespace for OXJS tests. */
var OXTest = {};

OXTest.Namespace = new YAHOO.tool.TestCase({
  name: 'Namespace Tests',

  testNamespaceExists: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX);
  }
});

OXTest.Base = new YAHOO.tool.TestCase({
  name: 'OX.Base Tests',

  testExtend: function () {
    var Assert = YAHOO.util.Assert;

    var tmp = OX.Base.extend();
    Assert.isObject(tmp);
    Assert.isFunction(tmp.extend);
    Assert.areNotSame(tmp, OX.Base);

    var tmp2 = tmp.extend({foo: 'foo'});
    Assert.areSame('foo', tmp2.foo);
    Assert.isUndefined(tmp.foo);
  },

  testMixin: function () {
    var Assert = YAHOO.util.Assert;

    var tmp = OX.Base.extend();
    tmp.mixin({foo: 'foo'});
    Assert.areSame('foo', tmp.foo);
  }
});

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

new YAHOO.tool.TestLogger();
YAHOO.tool.TestRunner.add(OXTest.Namespace);
YAHOO.tool.TestRunner.add(OXTest.Base);
YAHOO.tool.TestRunner.add(OXTest.Services);
YAHOO.tool.TestRunner.run();
