OXTest.Mixins = new YAHOO.tool.TestCase({
  name: 'OX Mixin Tests',

  testInDialog: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Mixins.InDialog);
    Assert.isFunction(OX.Mixins.InDialog.transfer);
  },

  testPreDialog: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Mixins.PreDialog);
    Assert.isFunction(OX.Mixins.PreDialog.hangup);
  },

  testCallLabeler: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Mixins.CallLabeler);
    Assert.isFunction(OX.Mixins.CallLabeler.label);
  },

  testSubscribable: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Mixins.Subscribable);
    Assert.isFunction(OX.Mixins.Subscribable.subscribe);
    Assert.isFunction(OX.Mixins.Subscribable.unsubscribe);
    Assert.isFunction(OX.Mixins.Subscribable.getItems);
  }
});

YAHOO.tool.TestRunner.add(OXTest.Mixins);
