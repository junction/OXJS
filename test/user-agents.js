OXTest.UserAgents = new YAHOO.tool.TestCase({
  name: 'UserAgents Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();
    this.UserAgents = this.ox.UserAgents;
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
    delete this.UserAgents;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Services.UserAgents,
                    'UserAgents mixin is not available');
    Assert.isObject(this.ox.UserAgents, 'UserAgents is not initialized');
    Assert.areSame(this.ox,             this.ox.UserAgents.connection);
  },

  testPubSubURI: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame('xmpp:pubsub.user-agents.xmpp.onsip.com',
                   this.UserAgents.pubSubURI,
                   'UserAgents.pubSub URI is wrong.');
  },

  testItemFromPacket: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.UserAgents.itemFromPacket,
                      'User agent service cannot turn packet into item.');

    var packet = OXTest.Packet.extendWithXML('<message from="user-agents.xmpp.onsip.com" to="me@example.com"><event xmlns="http://jabber.org/protocol/pubsub#event"><items node="/example.com/me"><item id="sip:jill@example.com:5060"><user-agent xmlns="onsip:user-agents"><contact>sip:jill@example.com:5060</contact><received>sip:jack@example.com:5060</received><device>Test UA</device><expires>2009-03-02T15:58:23Z</expires><event>insert</event></user-agent></item></items></event></message>');
    var item = this.UserAgents.itemFromPacket(packet);
    Assert.isObject(item, 'UserAgents.itemFromPacket did not return an object.');
    Assert.areSame(this.ox, item.connection,
                   'User agent item connection is wrong.');
    Assert.areSame('sip:jill@example.com:5060', item.contact,
                   'Contact is wrong');
    Assert.areSame('sip:jack@example.com:5060', item.received,
                   'Received is wrong.');
    Assert.areSame('Test UA', item.device, 'Device is wrong.');
    Assert.aresame('2009-03-02T15:58:23Z', item.expires, 'Expiry is wrong.');
    Assert.areSame('insert', item.event, 'Event type is wrong.');
  },

  testContact: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.UserAgents.Item.contact,
                          'UserAgents.Item.contact is undefined');
  },

  testReceived: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.UserAgents.Item.received,
                          'UserAgents.Item.received is undefined');
  },

  testDevice: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.UserAgents.Item.device,
                          'UserAgents.Item.device is undefined');
  },

  testExpires: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.UserAgents.Item.expires,
                          'UserAgents.Item.expires is undefined');
  },

  testEvent: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.UserAgents.Item.event,
                          'UserAgents.Item.event is undefined');
  }
});

YAHOO.tool.TestRunner.add(OXTest.UserAgents);
