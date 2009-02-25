OXTest.ActiveCalls = new YAHOO.tool.TestCase({
  name: 'ActiveCalls Tests',

  setUp: function () {
    this.ox = OX.Connection.extend();
    this.ox.initServices();
    this.ActiveCalls = this.ox.ActiveCalls;
  },

  tearDown: function () {
    delete this.ox;
    delete this.ActiveCalls;
  },

  testPubSubURI: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame('xmpp:pubsub.active-calls.xmpp.onsip.com',
                   this.ActiveCalls.pubSubURI,
                   'ActiveCalls.pubSubURI is wrong.');
  },

  testCommandURIs: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(this.ActiveCalls.commandURIs,
                    'ActiveCalls.commandURIs is not an object.');
    Assert.areSame('xmpp:commands.active-calls.xmpp.onsip.com?;node=transfer',
                   this.ActiveCalls.commandURIs.transfer,
                   'ActiveCalls.commandURIs.transfer is wrong');
    Assert.areSame('xmpp:commands.active-calls.xmpp.onsip.com?;node=create',
                   this.ActiveCalls.commandURIs.create,
                   'ActiveCalls.commandURIs.create is wrong');
    Assert.areSame('xmpp:commands.active-calls.xmpp.onsip.com?;node=terminate',
                   this.ActiveCalls.commandURIs.hangup,
                   'ActiveCalls.commandURIs.hangup is wrong');
  },

  testCreate: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.create,
                      'ActiveCalls.create is not a function.');
  },

  testSubscribe: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.subscribe,
                      'ActiveCalls.subscribe is not a function.');
  },

  testUnsubscribe: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.unsubscribe,
                      'ActiveCalls.unsubscribe is not a function.');
  },

  testGetItems: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.getItems,
                      'ActiveCalls.getItems is not a function.');
  },

  testRegisterHandler: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.registerHandler,
                      'ActiveCalls.registerHandler is not a function.');
  },

  testUnregisterHandler: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.unregisterHandler,
                      'ActiveCalls.unregisterHandler is not a function.');
  },

  testPreDialog: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(this.ActiveCalls.Item);
    Assert.isFunction(this.ActiveCalls.Item.hangup);
    Assert.isFunction(this.ActiveCalls.Item.label);
    Assert.isNotUndefined(this.ActiveCalls.Item.dialogState);
    Assert.isNotUndefined(this.ActiveCalls.Item.callID);
    Assert.isNotUndefined(this.ActiveCalls.Item.fromURI);
    Assert.isNotUndefined(this.ActiveCalls.Item.toURI);
    Assert.isNotUndefined(this.ActiveCalls.Item.uacAOR);
    Assert.isNotUndefined(this.ActiveCalls.Item.uasAOR);
    Assert.isNotUndefined(this.ActiveCalls.Item.fromTag);
  },

  testInDialog: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.Item.transfer);
    Assert.isFunction(this.ActiveCalls.Item.hangup);
    Assert.isFunction(this.ActiveCalls.Item.label);
    Assert.isNotUndefined(this.ActiveCalls.Item.dialogState);
    Assert.isNotUndefined(this.ActiveCalls.Item.callID);
    Assert.isNotUndefined(this.ActiveCalls.Item.fromURI);
    Assert.isNotUndefined(this.ActiveCalls.Item.toURI);
    Assert.isNotUndefined(this.ActiveCalls.Item.uacAOR);
    Assert.isNotUndefined(this.ActiveCalls.Item.uasAOR);
    Assert.isNotUndefined(this.ActiveCalls.Item.fromTag);
    Assert.isNotUndefined(this.ActiveCalls.Item.toTag);
  }
});

YAHOO.tool.TestRunner.add(OXTest.ActiveCalls);
