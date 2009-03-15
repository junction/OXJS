OXTest.RecentCalls = new YAHOO.tool.TestCase({
  name: 'RecentCalls Tests',

  _should: {
    /*
     * Don't target any recent-calls tests for now.
     */
    ignore: {
      testServiceMixin:   true,
      testPubSubURI:      true,
      testItemFromElement: true,
      testCallID:         true,
      testLabel:          true
    }
  },

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend().init();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();
    this.RecentCalls = this.ox.RecentCalls;
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
    delete this.RecentCalls;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Services.RecentCalls,
                    'RecentCalls mixin is not available');
    Assert.isObject(this.ox.RecentCalls, 'RecentCalls is not initialized');
    Assert.areSame(this.ox,              this.ox.RecentCalls.connection);
  },

  testPubSubURI: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame('xmpp:pubsub.recent-calls.xmpp.onsip.com',
                   this.RecentCalls.pubSubURI,
                   'RecentCalls.pubSub URI is wrong.');
  },

  testCommandURIs: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(this.RecentCalls.commandURIs,
                    'RecentCalls.commandURIs is not an object.');
    Assert.areSame('xmpp:commands.recent-calls.xmpp.onsip.com?;node=label',
                   this.RecentCalls.commandURIs.label,
                   'RecentCalls.commandURIs.transfer is wrong');
  },

  testItemFromElement: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.RecentCalls.itemFromElement,
                      'Recent call service cannot turn packet into item.');

    var itemXML = '';
    var packet = OXTest.Message.extend({
      from: 'user-agents.xmpp.onsip.com',
      to:   'me@example.com',
      doc:  OXTest.DOMParser.parse(itemXML)
    });
    var item = this.RecentCalls.itemFromElement(packet.doc);
    Assert.isObject(item, 'RecentCalls.itemFromElement did not return an object.');
    Assert.areSame(this.conn, item.connection,
                   'Recent call item connection is wrong.');
  },

  testCallID: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.RecentCalls.Item.callID,
                          'RecentCalls.Item.callID is undefined');
  },

  testLabel: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.RecentCalls.Item.label,
                      'RecentCalls.Item.label is not a function');

    var item = this.RecentCalls.Item.extend({callID:  '123'});
    Assert.isFunction(item.label,
                      'recent call item\'s label is not a function');
    item.label('wauug');
    Assert.isCommand(this.conn._data, 'commands.recent-calls.xmpp.onsip.com',
                     'label', {'call-id': '123',
                               'label':   'wauug'});
  }
});

YAHOO.tool.TestRunner.add(OXTest.RecentCalls);
