OXTest.Item = new YAHOO.tool.TestCase({
  name: 'Item Tests',

  setUp: function () {
    this.item = OX.Item.extend();
  },

  tearDown: function () {
    delete this.item;
  },

  testURI: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.item.uri);
  }
});

YAHOO.tool.TestRunner.add(OXTest.Item);
