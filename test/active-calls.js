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

  testItemFromElement: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.itemFromElement,
                      'ActiveCalls does not respond to itemFromElement');

    Assert.isUndefined(this.ActiveCalls.itemFromElement());

    var badPacket = OXTest.Packet.extendWithXML('<event xmlns="http://jabber.org/protocol/pubsub#event"><items/></event>');
    Assert.isUndefined(this.ActiveCalls.itemFromElement(badPacket.doc));

    var packet = OXTest.Packet.extendWithXML('<event xmlns="http://jabber.org/protocol/pubsub#event"><items node="/example.onsip.com/foo"><item id="301:NjEwOWU2ZTE5YzUwNjI0MjQ1ZGYwZjE0ZWVkNTA2NDU."><active-call xmlns="onsip:active-calls"><dialog-state>created</dialog-state><uac-aor>jill@example.com</uac-aor><uas-aor>jack@example.com</uas-aor><call-id>123</call-id><from-uri>sip:jill@example.com</from-uri><to-uri>sip:jack@example.com</to-uri><from-tag>999</from-tag><to-tag>666</to-tag></active-call></item></items></event>');
    var item = this.ActiveCalls.itemFromElement(packet.doc);
    Assert.isObject(item, 'ActiveCalls.itemFromElement did not return an object.');
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

  testCreateAPI: function() {
    var Assert = YAHOO.util.Assert;
    Assert.isFunction(this.ActiveCalls.create,
                      'ActiveCalls.create is not a function.');

  },

  testCreateSuccess: function () {
    var Assert = YAHOO.util.Assert,
      successCalled = false,
      response = OXTest.Packet.extendWithXML('<iq from="commands.active-calls.xmpp.onsip.com" type="result" to="jid@foo.com" id="theid" ><command xmlns="http://jabber.org/protocol/commands" status="completed" node="create" sessionid="123aSessID" ><x xmlns="jabber:x:data" type="result" ><field type="fixed" var="call-id" ><value>123aCallID</value></field></x></command></iq>');

    this.conn.addResponse(response);

    var callbacks = {
      onSuccess: function(packet) {
        successCalled = true;
        Assert.isObject(packet, "param to onSuccess is not an object");
      }
    };

    this.ActiveCalls.create('to@example.com', 'from@example.com', callbacks);

    Assert.areEqual(true, successCalled, "onSuccess was not called");

    Assert.isCommand(this.conn._data, 'commands.active-calls.xmpp.onsip.com',
                     'create', {to:   'to@example.com',
                                from: 'from@example.com'});
  },

  testCreateErorr: function() {
    var Assert = YAHOO.util.Assert,
      errorCalled = false,
      response = OXTest.Packet.extendWithXML('<iq from="commands.active-calls.xmpp.onsip.com" type="error" xml:lang="en" to="erick!junctionnetworks.com@dashboard.onsip.com/erocksbox" id="abb0a" ><command xmlns="http://jabber.org/protocol/commands" node="create" sessionid="df9818099854adbecd803b6be17a1bd2" ><x xmlns="jabber:x:data" type="submit" ><field type="text-single" var="from" ><value>foo</value></field><field type="text-single" var="to" ><value>bar</value></field></x></command><error type="modify" code="400" ><bad-request xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/><text xmlns="urn:ietf:params:xml:ns:xmpp-stanzas">Validation Errors; Field \'from\' is in an invalid format with value: foo; Field \'to\' is in an invalid format with value: bar</text><bad-payload xmlns="http://jabber.org/protocol/commands"/></error></iq>');

    this.conn.addResponse(response);

    var callbacks = {
      onError: function(packet) {
        errorCalled = true;
        Assert.isObject(packet, "param to onError is not an object");
      }
    };

    this.ActiveCalls.create('bar', 'foo', callbacks);

    Assert.areEqual(true, errorCalled, "onError was not called");
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
