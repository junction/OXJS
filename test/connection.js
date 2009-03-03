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
  }
});

YAHOO.tool.TestRunner.add(OXTest.Connection);
