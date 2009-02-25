OXTest.Error = new YAHOO.tool.TestCase({
  name: 'OX Error Tests',

  testExists: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Error);
    Assert.isFunction(OX.Error.toString);
  }
});

YAHOO.tool.TestRunner.add(OXTest.Error);
