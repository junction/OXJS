OXTest.ActiveCalls = new YAHOO.tool.TestCase({
  name: 'ActiveCalls Tests',

  eventXml: {
    createdEvent: '<message from="pubsub.active-calls.xmpp.onsip.com" to="foo!example.onsip.com@dashboard.onsip.com" >'
                  + '  <event xmlns="http://jabber.org/protocol/pubsub#event">'
                  + '    <items node="/example.onsip.com/foo" >'
                  + '      <item id="b5879e23d6a92cc11f01a29e466f7bd2" >'
                  + '        <active-call xmlns="onsip:active-calls">'
                  + '          <dialog-state>created</dialog-state>'
                  + '          <to-aor/>'
                  + '          <call-id>NjEwOWU2ZTE5YzUwNjI0MjQ1ZGYwZjE0ZWVkNTA2NDU.</call-id>'
                  + '          <from-uri>sip:foo@example.onsip.com</from-uri>'
                  + '          <to-uri>sip:other@example.onsip.com</to-uri>'
                  + '          <from-tag>419cce6a</from-tag>'
                  + '          <to-tag/>'
                  + '          <branch/>'
                  + '        </active-call>'
                  + '      </item>'
                  + '    </items>'
                  + '  </event>'
                  + '  <headers xmlns="http://jabber.org/protocol/shim">'
                  + '    <header name="Collection" >/me/foo!example.onsip.com@dashboard.onsip.com</header>'
                  + '  </headers>'
                  + '</message>',

    requestedEvent: '<message from="pubsub.active-calls.xmpp.onsip.com" to="foo!example.onsip.com@dashboard.onsip.com" >'
                    + '  <event xmlns="http://jabber.org/protocol/pubsub#event">'
                    + '    <items node="/example.onsip.com/foo" >'
                    + '      <item id="6859babae582000ff963b29394ddb4b5" >'
                    + '        <active-call xmlns="onsip:active-calls">'
                    + '          <dialog-state>requested</dialog-state>'
                    + '          <to-aor>foo@example.onsip.com</to-aor>'
                    + '          <call-id>ZDU0YTJhMWEzZWI3NWNmNmRkZTBhN2VmZmRmMGNkNGQ.</call-id>'
                    + '          <from-uri>sip:other@example.onsip.com</from-uri>'
                    + '          <to-uri>sip:foo@example.onsip.com</to-uri>'
                    + '          <from-tag>53498145</from-tag>'
                    + '          <to-tag/>'
                    + '          <branch>z9hG4bK7bb6.4c45a015.0</branch>'
                    + '        </active-call>'
                    + '      </item>'
                    + '    </items>'
                    + '  </event>'
                    + '  <headers xmlns="http://jabber.org/protocol/shim">'
                    + '    <header name="Collection" >/me/foo!example.onsip.com@dashboard.onsip.com</header>'
                    + '  </headers>'
                    + '</message>',

    confirmedEvent: '<message from="pubsub.active-calls.xmpp.onsip.com" to="foo!example.onsip.com@dashboard.onsip.com" >'
                    + '  <event xmlns="http://jabber.org/protocol/pubsub#event">'
                    + '    <items node="/example.onsip.com/foo" >'
                    + '      <item id="b5879e23d6a92cc11f01a29e466f7bd2" >'
                    + '        <active-call xmlns="onsip:active-calls">'
                    + '          <dialog-state>confirmed</dialog-state>'
                    + '          <to-aor>foo@example.onsip.com</to-aor>'
                    + '          <call-id>ZDU0YTJhMWEzZWI3NWNmNmRkZTBhN2VmZmRmMGNkNGQ.</call-id>'
                    + '          <from-uri>sip:other@example.onsip.com</from-uri>'
                    + '          <to-uri>sip:foo@example.onsip.com</to-uri>'
                    + '          <from-tag>53498145</from-tag>'
                    + '          <to-tag>as11173b9d</to-tag>'
                    + '          <branch>z9hG4bK7bb6.4c45a015.0</branch>'
                    + '        </active-call>'
                    + '      </item>'
                    + '    </items>'
                    + '  </event>'
                    + '  <headers xmlns="http://jabber.org/protocol/shim">'
                    + '    <header name="Collection" >/me/foo!example.onsip.com@dashboard.onsip.com</header>'
                    + '  </headers>'
                    + '</message>'
  },

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend().init();
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
                   this.ActiveCalls.commandURIs.terminate,
                   'ActiveCalls.commandURIs.terminate is wrong');
    Assert.areSame('xmpp:commands.active-calls.xmpp.onsip.com?;node=cancel',
                   this.ActiveCalls.commandURIs.cancel,
                   'ActiveCalls.commandURIs.cancel is wrong');
  },

/*
 * <active-call xmlns="onsip:active-calls">
 *   <dialog-state>created</dialog-state>
 *   <to-aor/>
 *   <call-id>NjEwOWU2ZTE5YzUwNjI0MjQ1ZGYwZjE0ZWVkNTA2NDU.</call-id>
 *   <from-uri>sip:foo@example.onsip.com</from-uri>
 *   <to-uri>sip:other@example.onsip.com</to-uri>
 *   <from-tag>419cce6a</from-tag>
 *   <to-tag/>
 *   <branch/>
 * </active-call>
 */
  testCreatedEvent: function() {
    var Assert = YAHOO.util.Assert;
    var element = OXTest.DOMParser.parse(OXTest.ActiveCalls.eventXml.createdEvent);

    var item = this.ActiveCalls.itemFromElement(element.doc);
    Assert.isObject(item,
                    'ActiveCalls.itemFromElement did not return an object.');

    Assert.areSame('created', item.dialogState, 'item.dialogState is incorrect');
    Assert.isNull(item.toAOR, 'item.toAOR is incorrect');
    Assert.areSame('NjEwOWU2ZTE5YzUwNjI0MjQ1ZGYwZjE0ZWVkNTA2NDU.', item.callID, 'item.callID is incorrect');
    Assert.areSame('sip:foo@example.onsip.com', item.fromURI, 'item.fromURI is incorrect');
    Assert.areSame('sip:other@example.onsip.com', item.toURI, 'item.toURI is incorrect');
    Assert.areSame('419cce6a', item.fromTag, 'item.fromTag is incorrect');
    Assert.isNull(item.toTag, 'item.toTag is incorrect');
    Assert.isNull(item.branch, 'item.branch is incorrect');

    Assert.isTrue(item.isCreated(), 'item is not created');
    Assert.isFalse(item.isConfirmed(), 'item is confirmed');
    Assert.isFalse(item.isRequested(), 'item is requested');
  },

  /*
   * <active-call xmlns="onsip:active-calls">
   *   <dialog-state>requested</dialog-state>
   *   <to-aor>foo@example.onsip.com</to-aor>
   *   <call-id>ZDU0YTJhMWEzZWI3NWNmNmRkZTBhN2VmZmRmMGNkNGQ.</call-id>
   *   <from-uri>sip:other@example.onsip.com</from-uri>
   *   <to-uri>sip:foo@example.onsip.com</to-uri>
   *   <from-tag>53498145</from-tag>
   *   <to-tag/>
   *   <branch>z9hG4bK7bb6.4c45a015.0</branch>
   * </active-call>
   */
  testRequestedEvent: function() {
    var Assert = YAHOO.util.Assert;
    var element = OXTest.DOMParser.parse(OXTest.ActiveCalls.eventXml.requestedEvent);

    var item = this.ActiveCalls.itemFromElement(element.doc);
    Assert.isObject(item,
                    'ActiveCalls.itemFromElement did not return an object.');

    Assert.areSame('requested', item.dialogState, 'item.dialogState is incorrect');
    Assert.areSame('foo@example.onsip.com', item.toAOR, 'item.toAOR is incorrect');
    Assert.areSame('ZDU0YTJhMWEzZWI3NWNmNmRkZTBhN2VmZmRmMGNkNGQ.', item.callID, 'item.callID is incorrect');
    Assert.areSame('sip:other@example.onsip.com', item.fromURI, 'item.fromURI is incorrect');
    Assert.areSame('sip:foo@example.onsip.com', item.toURI, 'item.toURI is incorrect');
    Assert.areSame('53498145', item.fromTag, 'item.fromTag is incorrect');
    Assert.isNull(item.toTag, 'item.toTag is incorrect');
    Assert.areSame('z9hG4bK7bb6.4c45a015.0', item.branch, 'item.branch is incorrect');

    Assert.isTrue(item.isRequested(), 'item is not requested');
    Assert.isFalse(item.isCreated(), 'item is created');
    Assert.isFalse(item.isConfirmed(), 'item is confirmed');
  },


  /*
   * <active-call xmlns="onsip:active-calls">
   *   <dialog-state>confirmed</dialog-state>
   *   <to-aor>foo@example.onsip.com</to-aor>
   *   <call-id>ZDU0YTJhMWEzZWI3NWNmNmRkZTBhN2VmZmRmMGNkNGQ.</call-id>
   *   <from-uri>sip:other@example.onsip.com</from-uri>
   *   <to-uri>sip:foo@example.onsip.com</to-uri>
   *   <from-tag>53498145</from-tag>
   *   <to-tag>as11173b9d</to-tag>
   *   <branch>z9hG4bK7bb6.4c45a015.0</branch>
   * </active-call>
   */
  testConfirmedEvent: function() {
    var Assert = YAHOO.util.Assert;
    var element = OXTest.DOMParser.parse(OXTest.ActiveCalls.eventXml.confirmedEvent);

    var item = this.ActiveCalls.itemFromElement(element.doc);
    Assert.isObject(item,
                    'ActiveCalls.itemFromElement did not return an object.');

    Assert.areSame('confirmed', item.dialogState, 'item.dialogState is incorrect');
    Assert.areSame('foo@example.onsip.com', item.toAOR, 'item.toAOR is incorrect');
    Assert.areSame('ZDU0YTJhMWEzZWI3NWNmNmRkZTBhN2VmZmRmMGNkNGQ.', item.callID, 'item.callID is incorrect');
    Assert.areSame('sip:other@example.onsip.com', item.fromURI, 'item.fromURI is incorrect');
    Assert.areSame('sip:foo@example.onsip.com', item.toURI, 'item.toURI is incorrect');
    Assert.areSame('53498145', item.fromTag, 'item.fromTag is incorrect');
    Assert.areSame('as11173b9d', item.toTag, 'item.toTag is incorrect');
    Assert.areSame('z9hG4bK7bb6.4c45a015.0', item.branch, 'item.branch is incorrect');

    Assert.isTrue(item.isConfirmed(), 'item is not confirmed');
    Assert.isFalse(item.isCreated(), 'item is created');
    Assert.isFalse(item.isRequested(), 'item is requested');
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

  testTerminate: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.Item.terminate,
                      'ActiveCalls.Item.terminate is not a function');
  },

  testCancel: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.Item.cancel,
                      'ActiveCalls.Item.cancel is not a function');
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

  testToAOR: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.toAOR,
                          'ActiveCalls.Item.toAOR is undefined');
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
  },

  testBranch: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.branch,
                          'ActiveCalls.Item.branch is undefined');
  }

});

YAHOO.tool.TestRunner.add(OXTest.ActiveCalls);
