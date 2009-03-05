OXTest.CallDialog = new YAHOO.tool.TestCase({
  name: 'CallDialog Mixin Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();

    this.CallDialog = OX.Base.extend(OX.Mixins.CallDialog, {
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

    Assert.isFunction(OX.Mixins.CallDialog.transfer,
                      'CallDialog.transfer is not a function.');
    this.CallDialog.transfer('alice@example.com');
    Assert.isCommand(this.conn._data, 'commands.active-calls.xmpp.onsip.com',
                     'transfer', {'to-address': 'transfer@example.onsip.com',
                                  'call-id':    'call-id',
                                  'to-tag':     'from-tag',
                                  'from-tag':   'to-tag'});
  },

  testHangup: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(OX.Mixins.CallDialog.hangup,
                      'CallDialog.hangup is not a function.');
    this.CallDialog.hangup();
    Assert.isCommand(this.conn._data, 'commands.active-calls.xmpp.onsip.com',
                     'hangup', {'call-id':  'call-id',
                                'to-tag':   'from-tag',
                                'from-tag': 'to-tag'});
  }
});

YAHOO.tool.TestRunner.add(OXTest.CallDialog);
