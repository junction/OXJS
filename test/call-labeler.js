OXTest.CallLabeler = new YAHOO.tool.TestCase({
  name: 'CallLabeler Mixin Tests',

  testCallLabeler: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Mixins.CallLabeler,
                    'CallLabeler mixin is not available.');
    Assert.isFunction(OX.Mixins.CallLabeler.label,
                      'CallLabeler.label is not a function.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.CallLabeler);
