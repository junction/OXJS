OXTest.Voicemail = new YAHOO.tool.TestCase({
  name: 'Voicemail Tests',

  setUp: function () {
    this.conn = {};
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();
    this.Voicemail = this.ox.Voicemail;
  },

  tearDown: function () {
    delete this.ox;
    delete this.Voicemail;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Voicemail,   'Voicemail mixin is not available');
    Assert.isObject(this.Voicemail, 'Voicemail is not initialized');
    Assert.areSame(this.conn,       this.ox.Voicemail.connection);
  }
});

YAHOO.tool.TestRunner.add(OXTest.Voicemail);
