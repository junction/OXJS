OXTest.CallDialog = new YAHOO.tool.TestCase({
  name: 'CallDialog Mixin Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connectionAdapter: this.conn});

    this.CallDialog = OX.Base.extend(OX.Mixin.CallDialog, {
      connection: this.ox,
      callID:     'call-id',
      fromTag:    'from-tag',
      toTag:      'to-tag'
    });
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
    delete this.CallDialog;
  },

  testTransfer: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(OX.Mixin.CallDialog.transfer,
                      'CallDialog.transfer is not a function.');
    this.CallDialog.transfer('sip:alice@example.com', 'callee');
    Assert.isCommand(this.conn._data, 'commands.active-calls.xmpp.onsip.com',
                     'transfer', {'target-uri': 'sip:alice@example.com',
                                  'endpoint':   'callee',
                                  'call-id':    'call-id',
                                  'to-tag':     'to-tag',
                                  'from-tag':   'from-tag'});
  },

  testTransferSuccess: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="commands.active-calls.xmpp.onsip.com" to="mock@example.com" id="test"/>'));

    var successFlag = false, errorFlag = false;
    this.CallDialog.transfer('sip:alice@example.com', 'callee', {
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });
    Assert.isFalse(errorFlag, 'Got error transferring a call.');
    Assert.isTrue(successFlag, 'Was not successful transferring a call.');
  },

  testTransferError: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="commands.active-calls.xmpp.onsip.com" to="mock@example.com" id="test" type="error"><error type="cancel"><bad-request xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/></error></iq>'));

    var successFlag = false, errorFlag = false;
    this.CallDialog.transfer('sip:alice@example.com', 'callee', {
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });
    Assert.isFalse(successFlag, 'Was successful transferring a call.');
    Assert.isTrue(errorFlag, 'Did not get error transferring a call.');
  },

  testTerminate: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(OX.Mixin.CallDialog.terminate,
                      'CallDialog.terminate is not a function.');
    this.CallDialog.terminate();
    Assert.isCommand(this.conn._data, 'commands.active-calls.xmpp.onsip.com',
                     'terminate', {'call-id':  'call-id',
                                   'to-tag':   'to-tag',
                                   'from-tag': 'from-tag'});
  },

  testTerminateSuccess: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="commands.active-calls.xmpp.onsip.com" to="mock@example.com" id="test"/>'));

    var successFlag = false, errorFlag = false;
    this.CallDialog.terminate({
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });
    Assert.isFalse(errorFlag, 'Got error hanging up a call.');
    Assert.isTrue(successFlag, 'Was not successful hanging up a call.');
  },

  testTerminateError: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="commands.active-calls.xmpp.onsip.com" to="mock@example.com" id="test" type="error"><error type="cancel"><bad-request xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/></error></iq>'));

    var successFlag = false, errorFlag = false;
    this.CallDialog.terminate({
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });
    Assert.isFalse(successFlag, 'Was successful hanging up a call.');
    Assert.isTrue(errorFlag, 'Did not get error hanging up a call.');
  },

  testCancel: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(OX.Mixin.CallDialog.cancel,
                      'CallDialog.cancel is not a function.');
    this.CallDialog.cancel();
    Assert.isCommand(this.conn._data, 'commands.active-calls.xmpp.onsip.com',
                     'cancel', {'call-id':  'call-id',
                                'from-tag': 'from-tag'});
  },

  testCancelSuccess: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="commands.active-calls.xmpp.onsip.com" to="mock@example.com" id="test"/>'));

    var successFlag = false, errorFlag = false;
    this.CallDialog.cancel({
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });
    Assert.isFalse(errorFlag, 'Got error hanging up a call.');
    Assert.isTrue(successFlag, 'Was not successful hanging up a call.');
  },

  testCancelError: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="commands.active-calls.xmpp.onsip.com" to="mock@example.com" id="test" type="error"><error type="cancel"><bad-request xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/></error></iq>'));

    var successFlag = false, errorFlag = false;
    this.CallDialog.cancel({
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });
    Assert.isFalse(successFlag, 'Was successful hanging up a call.');
    Assert.isTrue(errorFlag, 'Did not get error hanging up a call.');
  }

});

YAHOO.tool.TestRunner.add(OXTest.CallDialog);
