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
                   this.ActiveCalls.pubSubURI);
  },

  testCommandURIs: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(this.ActiveCalls.commandURIs);
    Assert.areSame('xmpp:commands.active-calls.xmpp.onsip.com?;node=transfer',
                   this.ActiveCalls.commandURIs.transfer);
    Assert.areSame('xmpp:commands.active-calls.xmpp.onsip.com?;node=create',
                   this.ActiveCalls.commandURIs.create);
    Assert.areSame('xmpp:commands.active-calls.xmpp.onsip.com?;node=terminate',
                   this.ActiveCalls.commandURIs.hangup);
  },

  testCreate: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.create);
  },

  testSubscribe: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.subscribe);
  },

  testUnsubscribe: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.unsubscribe);
  },

  testGetItems: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.getItems);
  },

  testRegisterHandler: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.registerHandler);
  },

  testUnregisterHandler: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.unregisterHandler);
  },

  testPreDialog: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(this.ActiveCalls.Item.PreDialog);
    Assert.isFunction(this.ActiveCalls.Item.PreDialog.hangup);
    Assert.isFunction(this.ActiveCalls.Item.PreDialog.label);
    Assert.isNotUndefined(this.ActiveCalls.Item.PreDialog.dialogState);
    Assert.isNotUndefined(this.ActiveCalls.Item.PreDialog.callID);
    Assert.isNotUndefined(this.ActiveCalls.Item.PreDialog.fromURI);
    Assert.isNotUndefined(this.ActiveCalls.Item.PreDialog.toURI);
    Assert.isNotUndefined(this.ActiveCalls.Item.PreDialog.uacAOR);
    Assert.isNotUndefined(this.ActiveCalls.Item.PreDialog.uasAOR);
    Assert.isNotUndefined(this.ActiveCalls.Item.PreDialog.fromTag);
  },

  testInDialog: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(this.ActiveCalls.Item.InDialog);
    Assert.isFunction(this.ActiveCalls.Item.InDialog.transfer);
    Assert.isFunction(this.ActiveCalls.Item.InDialog.hangup);
    Assert.isFunction(this.ActiveCalls.Item.InDialog.label);
    Assert.isNotUndefined(this.ActiveCalls.Item.PreDialog.dialogState);
    Assert.isNotUndefined(this.ActiveCalls.Item.PreDialog.callID);
    Assert.isNotUndefined(this.ActiveCalls.Item.PreDialog.fromURI);
    Assert.isNotUndefined(this.ActiveCalls.Item.PreDialog.toURI);
    Assert.isNotUndefined(this.ActiveCalls.Item.PreDialog.uacAOR);
    Assert.isNotUndefined(this.ActiveCalls.Item.PreDialog.uasAOR);
    Assert.isNotUndefined(this.ActiveCalls.Item.PreDialog.fromTag);
    Assert.isNotUndefined(this.ActiveCalls.Item.PreDialog.toTag);
  }
});

YAHOO.tool.TestRunner.add(OXTest.ActiveCalls);
