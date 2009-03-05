OXTest.ActiveCalls = new YAHOO.tool.TestCase({
  name: 'ActiveCalls Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();
    this.ActiveCalls = this.ox.ActiveCalls;

    this.successFlag = false;
    this.errorFlag = false;
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
    delete this.ActiveCalls;
    delete this.successFlag;
    delete this.errorFlag;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Services.ActiveCalls,
                    'ActiveCalls mixin is not available');
    Assert.isObject(this.ActiveCalls, 'ActiveCalls is not initialized');
    Assert.areSame(this.ox,           this.ox.ActiveCalls.connection);
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

  testItemFromPacket: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.itemFromPacket,
                      'Active call service cannot turn packet into item.');

    var packet = OXTest.Packet.extendWithXML('<event xmlns="http://jabber.org/protocol/pubsub#event"><items node="/example.onsip.com/foo"><item id="301:NjEwOWU2ZTE5YzUwNjI0MjQ1ZGYwZjE0ZWVkNTA2NDU."><active-call xmlns="onsip:active-calls"><dialog-state>created</dialog-state><uac-aor>jill@example.com</uac-aor><uas-aor>jack@example.com</uas-aor><call-id>123</call-id><from-uri>sip:jill@example.com</from-uri><to-uri>sip:jack@example.com</to-uri><from-tag>999</from-tag><to-tag>666</to-tag></active-call></item></items></event>');
    var item = this.ActiveCalls.itemFromPacket(packet);
    Assert.isObject(item, 'ActiveCalls.itemFromPacket did not return an object.');
    Assert.areSame(this.ox, item.connection,
                   'Active calls item connection is wrong.');
    Assert.areSame('created', item.dialogState,
                   'Active call item dialog state is wrong.');
    Assert.areSame('jill@example.com', item.uacAOR,
                   'Active call item uac aor is wrong.');
    Assert.areSame('jack@example.com', item.uasAOR,
                   'Active call item uas aor is wrong.');
    Assert.areSame('123', item.callID,
                   'Active call item call id is wrong.');
    Assert.areSame('sip:jill@example.com', item.fromURI,
                   'Active call item from URI is wrong.');
    Assert.areSame('sip:jack@example.com', item.toURI,
                   'Active call item to URI is wrong.');
    Assert.areSame('999', item.fromTag,
                   'Active call item from tag is wrong.');
    Assert.areSame('666', item.toTag,
                   'Active call item to tag is wrong.');
  },

  testCreate: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.create,
                      'ActiveCalls.create is not a function.');

    this.ActiveCalls.create('to@example.com', 'from@example.com');

    Assert.isCommand(this.conn._data, 'commands.active-calls.xmpp.onsip.com',
                     'create', {to:   'to@example.com',
                                from: 'from@example.com'});
  },


  testHangup: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.Item.hangup,
                      'ActiveCalls.Item.hangup is not a function');
  },

  testTransfer: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.Item.transfer,
                      'ActiveCalls.Item.transfer is not a function');
  },

  testLabel: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.Item.label,
                      'ActiveCalls.Item.label is not a function');
  },

  testDialogState: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.dialogState,
                          'ActiveCalls.Item.dialogState is undefined');
  },

  testCallID: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.callID,
                          'ActiveCalls.Item.callID is undefined');
  },

  testFromURI: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.fromURI,
                          'ActiveCalls.Item.fromURI is undefined');
  },

  testToURI: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.toURI,
                          'ActiveCalls.Item.toURI is undefined');
  },

  testUACAOR: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.uacAOR,
                          'ActiveCalls.Item.uacAOR is undefined');
  },

  testUASAOR: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.uasAOR,
                          'ActiveCalls.Item.uasAOR is undefined');
  },

  testFromTag: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.fromTag,
                          'ActiveCalls.Item.fromTag is undefined');
  },

  testToTag: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.toTag,
                          'ActiveCalls.Item.toTag is undefined');
  }
});

YAHOO.tool.TestRunner.add(OXTest.ActiveCalls);
