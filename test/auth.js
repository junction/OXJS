OXTest.Auth = new YAHOO.tool.TestCase({
  name: 'Auth Tests',

  setUp: function () {
    this.conn = {};
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();

    this.Auth = this.ox.Auth;
  },

  tearDown: function () {
    delete this.ox;
    delete this.Auth;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Auth,   'Auth mixin is not available');
    Assert.isObject(this.Auth, 'Auth mixin is not initialized');
    Assert.areSame(this.conn,  this.ox.Auth.connection);
  },

  testAuthorizePlain: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.Auth.authenticatePlain,
                      'Plaintext auth function not available.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Auth);
