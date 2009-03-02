OXTest.Mixins = new YAHOO.tool.TestCase({
  name: 'OX Mixin Tests',

  testCallDialog: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Mixins.CallDialog, 'CallDialog mixin is not available.');
    Assert.isFunction(OX.Mixins.CallDialog.transfer,
                      'CallDialog.transfer is not a function.');
    Assert.isFunction(OX.Mixins.CallDialog.hangup,
                      'CallDialog.hangup is not a function.');
  },

  testCallLabeler: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Mixins.CallLabeler,
                    'CallLabeler mixin is not available.');
    Assert.isFunction(OX.Mixins.CallLabeler.label,
                      'CallLabeler.label is not a function.');
  },

  testSubscribable: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Mixins.Subscribable,
                    'Subscribable mixin is not available.');
    Assert.isFunction(OX.Mixins.Subscribable.subscribe,
                      'Subscribable.subscribe is not a function.');
    Assert.isFunction(OX.Mixins.Subscribable.unsubscribe,
                      'Subscribable.unsubscribe is not a function.');
    Assert.isFunction(OX.Mixins.Subscribable.getItems,
                      'Subscribable.getItems is not a function.');
    Assert.isFunction(OX.Mixins.Subscribable.registerHandler,
                      'Subscribable.registerHandler is not a function.');
    Assert.isFunction(OX.Mixins.Subscribable.unregisterHandler,
                      'Subscribable.unregisterHandler is not a function.');

    Assert.isObject(OX.Mixins.Subscribable._subscriptionHandlers,
                    'Subscribable.subscriptionHandlers is not an object.');
    Assert.isFunction(OX.Mixins.Subscribable._subscriptionHandlers.onPending,
                      'Pending subscription handler is not a function.');
    Assert.isFunction(OX.Mixins.Subscribable._subscriptionHandlers.onSubscribed,
                      'Subscribed subscription handler is not a function.');
    Assert.isFunction(OX.Mixins.Subscribable._subscriptionHandlers.onUnsubscribed,
                      'Unsubscribed subscription handler is not a function.');
    Assert.isFunction(OX.Mixins.Subscribable._subscriptionHandlers.onPublish,
                      'Publish item handler is not a function.');
    Assert.isFunction(OX.Mixins.Subscribable._subscriptionHandlers.onRetract,
                      'Retract item handler is not a function.');

    Assert.isFunction(OX.Mixins.Subscribable.itemFromPacket,
                      'Item from packet function missing on subscribable mixin.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Mixins);
