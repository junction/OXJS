OXTest.ConnectionAdapter = new YAHOO.tool.TestCase({
  name: 'OX Connection Adapter Tests',

  testInterface: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(OX.ConnectionAdapter.jid);
    Assert.isNotUndefined(OX.ConnectionAdapter.send);
    Assert.isNotUndefined(OX.ConnectionAdapter.registerHandler);
    Assert.isNotUndefined(OX.ConnectionAdapter.unregisterHandler);

    Assert.isFunction(OX.ConnectionAdapter.jid,
                      'OX.ConnectionAdapter.jid is not a function.');
    Assert.isFunction(OX.ConnectionAdapter.send,
                      'OX.ConnectionAdapter.send is not a function.');
    Assert.isFunction(OX.ConnectionAdapter.registerHandler,
                      'OX.ConnectionAdapter.registerHandler is not a function.');
    Assert.isFunction(OX.ConnectionAdapter.unregisterHandler,
                      'OX.ConnectionAdapter.unregisterHandler is not a function.');

  },

  testRequiredInterface: function () {
    var Assert = YAHOO.util.Assert;
    Assert.throws(OX.Error, OX.ConnectionAdapter.jid,
                  'Calling jid() without overriding the function SHOULD throw an error');
    Assert.throws(OX.Error, OX.ConnectionAdapter.send,
                  'Calling send() without overriding the function SHOULD throw an error');
    Assert.throws(OX.Error, OX.ConnectionAdapter.registerHandler,
                  'Calling registerHandler() without overriding the function SHOULD throw an error');

    Assert.throws(OX.Error, OX.ConnectionAdapter.unregisterHandler,
                  'Calling unregisterHandler() without overriding the function SHOULD throw an error');
  }
});

YAHOO.tool.TestRunner.add(OXTest.ConnectionAdapter);
