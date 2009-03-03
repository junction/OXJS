OXTest.Subscribable = new YAHOO.tool.TestCase({
  name: 'Subscribable Mixin Tests',

  testFollowRedirect: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame(0, 1, 'Verify that redirects are automatically followed.');
  },

  testFiresPendingWithIQ: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame(0, 1, 'Verify that onPending fires as IQ response.');
  },

  testFiresSubscribedWithIQ: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame(0, 1, 'Verify that onSubscribed fires as IQ response.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Subscribable);