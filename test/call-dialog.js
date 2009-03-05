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

  testTransferSuccess: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    Assert.isFunction(OX.Mixins.CallDialog.transfer,
                      'CallDialog.transfer is not a function.');
    this.CallDialog.transfer('alice@example.com', {
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });
    Assert.isCommand(this.conn._data, 'commands.active-calls.xmpp.onsip.com',
                     'transfer', {'to-address': 'alice@example.com',
                                  'call-id':    'call-id',
                                  'to-tag':     'to-tag',
                                  'from-tag':   'from-tag'});
    Assert.isFalse(errorFlag, 'Got error transferring a call.');
    Assert.isTrue(successFlag, 'Was not successful transferring a call.');
  },

  testTransferError: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    Assert.isFunction(OX.Mixins.CallDialog.transfer,
                      'CallDialog.transfer is not a function.');
    this.CallDialog.transfer('alice@example.com', {
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });
    Assert.isCommand(this.conn._data, 'commands.active-calls.xmpp.onsip.com',
                     'transfer', {'to-address': 'alice@example.com',
                                  'call-id':    'call-id',
                                  'to-tag':     'to-tag',
                                  'from-tag':   'from-tag'});
    Assert.isFalse(successFlag, 'Was successful transferring a call.');
    Assert.isTrue(errorFlag, 'Did not get error transferring a call.');
  },

  testHangupSuccess: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    Assert.isFunction(OX.Mixins.CallDialog.hangup,
                      'CallDialog.hangup is not a function.');
    this.CallDialog.hangup({
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });
    Assert.isCommand(this.conn._data, 'commands.active-calls.xmpp.onsip.com',
                     'hangup', {'call-id':  'call-id',
                                'to-tag':   'to-tag',
                                'from-tag': 'from-tag'});
    Assert.isFalse(errorFlag, 'Got error hanging up a call.');
    Assert.isTrue(successFlag, 'Was not successful hanging up a call.');
  },

  testHangupError: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    Assert.isFunction(OX.Mixins.CallDialog.hangup,
                      'CallDialog.hangup is not a function.');
    this.CallDialog.hangup({
      onSuccess: function () { successFlag = true; },
      onError:   function () { errorFlag   = true; }
    });
    Assert.isCommand(this.conn._data, 'commands.active-calls.xmpp.onsip.com',
                     'hangup', {'call-id':  'call-id',
                                'to-tag':   'to-tag',
                                'from-tag': 'from-tag'});
    Assert.isFalse(successFlag, 'Was successful hanging up a call.');
    Assert.isTrue(errorFlag, 'Did not get error hanging up a call.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.CallDialog);
