/* Namespace for OXJS tests. */
var OXTest = {};

OXTest.Namespace = new YAHOO.tool.TestCase({
  name: 'Namespace Tests',

  testNamespaceExists: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX);
  }
});

new YAHOO.tool.TestLogger();
YAHOO.tool.TestRunner.add(OXTest.Namespace);
YAHOO.tool.TestRunner.run();
