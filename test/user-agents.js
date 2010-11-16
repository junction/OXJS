OXTest.UserAgents = new YAHOO.tool.TestCase({
  name: 'UserAgents Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connectionAdapter: this.conn});
    this.UserAgents = this.ox.UserAgents;
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
    delete this.UserAgents;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Service.UserAgents,
                    'UserAgents mixin is not available');
    Assert.isObject(this.ox.UserAgents, 'UserAgents is not initialized');
    Assert.areSame(this.ox,             this.ox.UserAgents.connection);
  },

  testPubSubURI: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame('xmpp:pubsub.user-agents.xmpp.onsip.com',
                   this.UserAgents.pubSubURI.toString(),
                   'UserAgents.pubSub URI is wrong.');
  },

  testItemFromElement: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.UserAgents.itemFromElement,
                      'User agent service cannot turn packet into item.');

    var element = OXTest.DOMParser.parse('<item id="sip:jill@example.com:5060"><user-agent publish-time="2009-11-23T23:28:22Z" xmlns="onsip:user-agents"><contact>sip:jill@example.com:5060</contact><received>sip:jack@example.com:5060</received><device>Test UA</device><expires>2009-03-02T15:58:23Z</expires></user-agent></item>');
    var item = this.UserAgents.itemFromElement(element.doc);
    Assert.isObject(item, 'UserAgents.itemFromElement did not return an object.');
    Assert.areSame(this.ox, item.connection,
                   'User agent item connection is wrong.');

    Assert.areSame('sip:jill@example.com:5060', item.contact,
                   'Contact is wrong');
    Assert.areSame('sip:jack@example.com:5060', item.received,
                   'Received is wrong.');
    Assert.areSame('Test UA', item.device, 'Device is wrong.');
    Assert.areSame('2009-03-02T15:58:23Z', item.expires, 'Expiry is wrong.');
  },

  testItemFromElementMissingElements: function () {
    var Assert = YAHOO.util.Assert;

    var element = OXTest.DOMParser.parse('<item id="sip:jill@example.com:5060"><user-agent publish-time="2009-11-23T23:28:22Z" xmlns="onsip:user-agents"><contact>sip:jill@example.com:5060</contact><received/><device/><expires/></user-agent></item>');
    var item = this.UserAgents.itemFromElement(element.doc);
    Assert.isObject(item, 'UserAgents.itemFromElement did not return an object.');
    Assert.isUndefined(item.received, 'Missing received should be undefined');
    Assert.isUndefined(item.device,   'Missing device should be undefined');
    Assert.isUndefined(item.expires,  'Missing expires should be undefined');
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
  }
});

YAHOO.tool.TestRunner.add(OXTest.UserAgents);
