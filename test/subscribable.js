OXTest.Subscribable = new YAHOO.tool.TestCase({
  name: 'Subscribable Mixin Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.Subscribable = OX.Base.extend(OX.Mixins.Subscribable,
                                       {connection: this.conn,
                                        pubSubURI:  'xmpp:pubsub@example.com'});
  },

  tearDown: function () {
    delete this.conn;
    delete this.Subscribable;
  },

  testFollowRedirect: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame(0, 1, 'Verify that redirects are automatically followed.');
  },

  testSubscribe: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    this.Subscribable.subscribe('/', {
      onSucess: function (requestedURI, finalURI) {
        successFlag = true;
        Assert.areSame(requestedURI, finalURI,
                       'requested and final uri differ when successful.');
        Assert.areSame('/', requestedURI,
                       'requestedURI is not actual requested uri.');
      },

      onError: function (requestedURI, finalURI) {
        errorFlag = true;
        Assert.areSame(requestedURI, finalURI,
                       'requested and final uri differ on error.');
        Assert.areSame('/', requestedURI,
                       'requestedURI is not actual requested uri.');
      }
    });

    Assert.isSubscribe(this.conn._data, 'pubsub@example.com', '/',
                       'test@example.com');
    Assert.areSame(false, errorFlag,
                   'Got error trying to subscribe.');
    Assert.areSame(true, successFlag,
                   'Was not successful trying to subscribe.');
  },

  testSubscribeError: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame(0, 1, 'Verify that subscribe onError fires.');
  },

  testUnsubscribe: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    this.Subscribable.unsubscribe('/', {
      onSucess: function (requestedURI, finalURI) {
        successFlag = true;
        Assert.areSame(requestedURI, finalURI,
                       'requested and final uri differ when successful.');
        Assert.areSame('/', requestedURI,
                       'requestedURI is not actual requested uri.');
      },

      onError: function (requestedURI, finalURI) {
        errorFlag = true;
        Assert.areSame(requestedURI, finalURI,
                       'requested and final uri differ on error.');
        Assert.areSame('/', requestedURI,
                       'requestedURI is not actual requested uri.');
      }
    });

    Assert.isUnsubscribe(this.conn._data, 'pubsub@example.com', '/',
                         'test@example.com');
    Assert.areSame(false, this.errorFlag,
                   'Got error trying to unsubscribe.');
    Assert.areSame(true,  this.successFlag,
                   'Was not successful trying to unsubscribe.');
  },

  testUnsubscribeError: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame(0, 1, 'Verify that unsubscribe onError fires.');
  },

  testFiresPendingWithEvent: function () { 
    var Assert = YAHOO.util.Assert;

    Assert.areSame(0, 1, 'Verify that onPending fires as event handler.');
  },

  testFiresSubscribedWithEvent: function () { 
    var Assert = YAHOO.util.Assert;

    Assert.areSame(0, 1, 'Verify that onPending fires as event handler.');
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