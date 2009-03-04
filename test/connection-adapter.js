OXTest.ConnectionAdapter = new YAHOO.tool.TestCase({
  name: 'OX Connection Adapter Tests',

  testInterface: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(OX.ConnectionAdapter.jid);
    Assert.isNotUndefined(OX.ConnectionAdapter.send);
    Assert.isNotUndefined(OX.ConnectionAdapter.registerHandler);
    Assert.isNotUndefined(OX.ConnectionAdapter.unregisterHandler);
  }
});

YAHOO.tool.TestRunner.add(OXTest.ConnectionAdapter);
