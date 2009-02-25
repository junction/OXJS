OXTest.Namespace = new YAHOO.tool.TestCase({
  name: 'Namespace Tests',

  testNamespaceExists: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX);
  }
});

YAHOO.tool.TestRunner.add(OXTest.Namespace);
