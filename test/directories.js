OXTest.Directories = new YAHOO.tool.TestCase({
  name: 'Directories Tests',

  setUp: function () {
    this.conn = {};
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();
    this.Directories = this.ox.Directories;
  },

  tearDown: function () {
    delete this.ox;
    delete this.Directories;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Services.Directories,
                    'Directories mixin is not available');
    Assert.isObject(this.Directories, 'Directories is not initialized');
    Assert.areSame(this.conn,         this.ox.Directories.connection);
  }
});

YAHOO.tool.TestRunner.add(OXTest.Directories);
