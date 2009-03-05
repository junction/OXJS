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
  }
});

YAHOO.tool.TestRunner.add(OXTest.CallLabeler);
