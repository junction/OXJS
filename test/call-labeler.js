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

  testLabelSuccess: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    Assert.isFunction(this.CallLabeler.label,
                      'CallLabeler.label is not a function.');
    this.CallLabeler.label('wauug', {
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });
    Assert.isCommand(this.conn._data, 'commands.recent-calls.xmpp.onsip.com',
                     'label', {'call-id': 'call-id',
                               'label':   'wauug'});
    Assert.isFalse(errorFlag, 'Got error labeling a call.');
    Assert.isTrue(successFlag, 'Was not successful labeling a call.');
  },

  testLabelError: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    Assert.isFunction(this.CallLabeler.label,
                      'CallLabeler.label is not a function.');
    this.CallLabeler.label('wauug', {
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });
    Assert.isCommand(this.conn._data, 'commands.recent-calls.xmpp.onsip.com',
                     'label', {'call-id': 'call-id',
                               'label':   'wauug'});
    Assert.isFalse(successFlag, 'Was successful labeling a call.');
    Assert.isTrue(errorFlag, 'Did not get error labeling a call.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.CallLabeler);
