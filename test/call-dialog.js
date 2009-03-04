OXTest.CallDialog = new YAHOO.tool.TestCase({
  name: 'CallDialog Mixin Tests',

  testCallDialog: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Mixins.CallDialog, 'CallDialog mixin is not available.');
    Assert.isFunction(OX.Mixins.CallDialog.transfer,
                      'CallDialog.transfer is not a function.');
    Assert.isFunction(OX.Mixins.CallDialog.hangup,
                      'CallDialog.hangup is not a function.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Mixins);
