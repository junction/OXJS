OXTest.CallLabeler = new YAHOO.tool.TestCase({
  name: 'CallLabeler Mixin Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();

    this.CallLabeler = OX.Base.extend(OX.Mixins.CallLabeler, {
      connection: this.ox,
      callID:     'call-id'
    });
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
    delete this.CallLabeler;
  },

  testLabel: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.CallLabeler.label,
                      'CallLabeler.label is not a function.');
    this.CallLabeler.label('wauug');
    Assert.isCommand(this.conn._data, 'commands.recent-calls.xmpp.onsip.com',
                     'label', {'call-id': 'call-id',
                               'label':   'wauug'});
  },

  testLabelSuccess: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="commands.recent-calls.xmpp.onsip.com" to="mock@example.com" id="test"/>'));

    var successFlag = false, errorFlag = false;
    this.CallLabeler.label('wauug', {
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });
    Assert.isFalse(errorFlag, 'Got error labeling a call.');
    Assert.isTrue(successFlag, 'Was not successful labeling a call.');
  },

  testLabelError: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="commands.recent-calls.xmpp.onsip.com" to="mock@example.com" type="error" id="test"><error type="cancel"><bad-request xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/></error></iq>'));

    var successFlag = false, errorFlag = false;
    this.CallLabeler.label('wauug', {
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });
    Assert.isFalse(successFlag, 'Was successful labeling a call.');
    Assert.isTrue(errorFlag, 'Did not get error labeling a call.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.CallLabeler);
