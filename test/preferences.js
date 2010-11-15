OXTest.Preferences = new YAHOO.tool.TestCase({
  name: 'Preferences Tests',

  _should: {
    /*
     * Don't target any preferences tests for now.
     */
    ignore: {
      testServiceMixin:   true,
      testPubSubURI:      true,
      testItemFromElement: true
    }
  },

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connectionAdapter: this.conn});
    this.Preferences = this.ox.Preferences;
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
    delete this.Preferences;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Service.Preferences,
                    'Preferences mixin is not available');
    Assert.isObject(this.ox.Preferences, 'Preferences is not initialized');
    Assert.areSame(this.ox,              this.ox.Preferences.connection);
  },

  testPubSubURI: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame('xmpp:pubsub.preferences.xmpp.onsip.com',
                   this.Preferences.pubSubURI,
                   'Preferences.pubSub URI is wrong.');
  },

  testItemFromElement: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.Preferences.itemFromElement,
                      'Preferences service cannot turn packet into item.');

    var itemXML = '';
    var packet = OXTest.Message.extend({
      from: 'user-agents.xmpp.onsip.com',
      to:   'me@example.com',
      doc:  OXTest.DOMParser.parse(itemXML)
    });
    var item = this.Preferences.itemFromElement(packet.doc);
    Assert.isObject(item, 'Preferences.itemFromElement did not return an object.');
    Assert.areSame(this.conn, item.connection,
                   'Preferences item connection is wrong.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Preferences);
