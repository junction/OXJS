OXTest.Voicemail = new YAHOO.tool.TestCase({
  name: 'Voicemail Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
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

    Assert.isObject(OX.Services.Voicemail,
                    'Voicemail mixin is not available');
    Assert.isObject(this.Voicemail, 'Voicemail is not initialized');
    Assert.areSame(this.conn,       this.ox.Voicemail.connection);
  },

  testItemFromPacket: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.Voicemail.itemFromPacket,
                      'Voicemail service cannot turn packet into item.');

    var itemXML = '';
    var packet = OXTest.Message.extend({
      from: 'user-agents.xmpp.onsip.com',
      to:   'me@example.com',
      doc:  OXTest.DOMParser.parse(itemXML)
    });
    var item = this.Voicemail.itemFromPacket(packet);
    Assert.isObject(item, 'Preferences.itemFromPacket did not return an object.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Voicemail);
