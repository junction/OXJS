OXTest.UserAgents = new YAHOO.tool.TestCase({
  name: 'UserAgents Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();
    this.UserAgents = this.ox.UserAgents;
  },

  tearDown: function () {
    delete this.ox;
    delete this.UserAgents;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Services.UserAgents,
                    'UserAgents mixin is not available');
    Assert.isObject(this.ox.UserAgents, 'UserAgents is not initialized');
    Assert.areSame(this.conn,           this.ox.UserAgents.connection);
  },

  testItemFromPacket: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.UserAgents.itemFromPacket,
                      'User agent service cannot turn packet into item.');

    var itemXML = '<event xmlns="http://jabber.org/protocol/pubsub#event"><items node="/example.com/me"><item id="sip:jill@example.com:5060"><user-agent xmlns="onsip:user-agents"><contact>sip:jill@example.com:5060</contact><received>sip:jack@example.com:5060</received><device>Test UA</device><expires>2009-03-02T15:58:23Z</expires><event>insert</event></user-agent></item></items></event>';

    var packet = OXTest.Message.extend({
      from: 'user-agents.xmpp.onsip.com',
      to:   'me@example.com',
      doc:  OXTest.DOMParser.parse(itemXML)
    });
    var item = this.UserAgents.itemFromPacket(packet);
    Assert.isObject(item, 'UserAgents.itemFromPacket did not return an object.');
    Assert.areSame('sip:jill@example.com:5060', item.contact,
                   'Contact is wrong');
    Assert.areSame('sip:jack@example.com:5060', item.received,
                   'Received is wrong.');
    Assert.areSame('Test UA', item.device, 'Device is wrong.');
    Assert.aresame('2009-03-02T15:58:23Z', item.expires, 'Expiry is wrong.');
    Assert.areSame('insert', item.event, 'Event type is wrong.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.UserAgents);
