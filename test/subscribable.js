OXTest.Subscribable = new YAHOO.tool.TestCase({
  name: 'Subscribable Mixin Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();

    var that = this;
    var itemFromElement = function () {
      return that.itemFromElement.apply(that, arguments);
    };

    this.Subscribable = OX.Base.extend(OX.Mixins.Subscribable, {
      connection:     this.ox,
      pubSubURI:      'xmpp:pubsub@example.com',
      itemFromElement: itemFromElement
    });
    this.Subscribable.registerSubscriptionHandlers();
  },

  itemFromElement: function (element) {
    return 'item';
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
    delete this.Subscribable;
  },

  testSubscribe: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="/" jid="mock@example.com" subscription="subscribed"/></pubsub></iq>'));
    this.Subscribable.subscribe('/', {
      onSuccess: function (requestedURI, finalURI, packet) {
        successFlag = true;
        Assert.isObject(packet, 'packet in handler is not an object.');
        Assert.areSame('xmpp:pubsub@example.com?;node=/',
                       requestedURI.toString(),
                       'requestedURI is not actual requested uri.');
        Assert.areSame(requestedURI.toString(), finalURI.toString(),
                       'requested and final uri differ when successful.');
      },

      onError: function () {
        errorFlag = true;
      }
    });

    Assert.isSubscribe(this.conn._data, 'pubsub@example.com', '/',
                       'mock@example.com');
    Assert.areSame(false, errorFlag,
                   'Got error trying to subscribe.');
    Assert.areSame(true, successFlag,
                   'Was not successful trying to subscribe.');
  },

  testSubscribeError: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="error" id="test"><subscribe node="/" jid="mock@example.com"/><error type="cancel"><bad-request xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/><invalid-jid xmlns="http://jabber.org/protocol/pubsub#errors"/></error></iq>'));
    this.Subscribable.subscribe('/', {
      onSuccess: function () {
        successFlag = true;
      },

      onError: function (requestedURI, finalURI, packet) {
        errorFlag = true;
        Assert.isObject(packet, 'packet in handler is not an object.');
        Assert.areSame('xmpp:pubsub@example.com?;node=/',
                       requestedURI.toString(),
                       'requestedURI is not actual requested uri.');
        Assert.areSame(requestedURI.toString(), finalURI.toString(),
                       'requested and final uri differ on error.');
      }
    });

    Assert.areSame(false, successFlag,
                   'Was successful trying to subscribe.');
    Assert.areSame(true, errorFlag,
                   'Did not get error trying to subscribe.');
  },

  testUnsubscribe: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="result" id="test"/></iq>'));
    this.Subscribable.unsubscribe('/', {
      onSuccess: function (uri, packet) {
        successFlag = true;
        Assert.isObject(packet, 'packet in handler is not an object.');
        Assert.areSame('xmpp:pubsub@example.com?;node=/',
                       uri.toString(), 'uri is wrong.');
      },

      onError: function () {
        errorFlag = true;
      }
    });

    Assert.isUnsubscribe(this.conn._data, 'pubsub@example.com', '/',
                         'mock@example.com');
    Assert.areSame(false, errorFlag,
                   'Got error trying to unsubscribe.');
    Assert.areSame(true,  successFlag,
                   'Was not successful trying to unsubscribe.');
  },

  testUnsubscribeError: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="error" id="test"><unsubscribe node="/" jid="mock@example.com"/><error type="cancel"><unexpected-request xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/><not-subscribed xmlns="http://jabber.org/protocol/pubsub#errors"/></error></iq>'));
    this.Subscribable.unsubscribe('/', {
      onSuccess: function () {
        successFlag = true;
      },

      onError: function (uri, packet) {
        errorFlag = true;
        Assert.isObject(packet, 'packet in handler is not an object.');
        Assert.areSame('xmpp:pubsub@example.com?;node=/',
                       uri.toString(), 'uri is wrong.');
      }
    });

    Assert.areSame(false,  successFlag,
                   'Was successful trying to unsubscribe.');
    Assert.areSame(true, errorFlag,
                   'Did not get error trying to unsubscribe.');
  },

  testFiresPendingWithEvent: function () {
    var Assert = YAHOO.util.Assert;

    var packet = OXTest.Packet.extendWithXML('<message from="pubsub@example.com" to="mock@example.com"><event xmlns="http://jabber.org/protocol/pubsub#event"><subscription node="/" jid="mock@example.com" subscription="pending"/></event></message>');

    var pendingFlag = false;
    this.Subscribable.registerHandler('onPending', function (uri) {
      pendingFlag = true;
      Assert.areSame('xmpp:pubsub@example.com?;node=/', uri.toString(),
                     'Requested URI for pending is wrong.');
    });
    this.Subscribable.subscribe('/');

    this.conn.fireEvent('message', packet);
    Assert.areSame(true, pendingFlag,
                   'Did not get pending event trying to subscribe.');
  },

  testFiresSubscribedWithEvent: function () {
    var Assert = YAHOO.util.Assert;

    var packet = OXTest.Packet.extendWithXML('<message from="pubsub@example.com" to="mock@example.com"><event xmlns="http://jabber.org/protocol/pubsub#event"><subscription node="/" jid="mock@example.com" subscription="subscribed"/></event></message>');

    var subscribedFlag = false;
    this.Subscribable.registerHandler('onSubscribed', function (uri) {
      subscribedFlag = true;
      Assert.areSame('xmpp:pubsub@example.com?;node=/', uri.toString(),
                     'Requested URI for subscribed is wrong.');
    });
    this.Subscribable.subscribe('/');

    this.conn.fireEvent('message', packet);
    Assert.areSame(true, subscribedFlag,
                   'Did not get subscribed event trying to subscribe.');
  },

  testFiresPendingWithIQ: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, pendingFlag = false;
    this.Subscribable.registerHandler('onPending', function () {
      pendingFlag = true;
    });
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq type="result" from="pubsub@example.com" to="mock@example.com" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="/" jid="mock@example.com" subscription="pending"/></pubsub></iq>'));
    this.Subscribable.subscribe('/', {
      onSuccess: function (requestedURI, finalURI, packet) {
        successFlag = true;
      }
    });
    Assert.areSame(true, successFlag,
                   'Was not successful trying to subscribe.');
    Assert.areSame(true, pendingFlag,
                   'Was not pending trying to subscribe.');
  },

  testFiresPendingWithIQNoCallbacks: function () {
    var Assert = YAHOO.util.Assert;

    var pendingFlag = false;
    this.Subscribable.registerHandler('onPending', function () {
      pendingFlag = true;
    });
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="/" jid="mock@example.com" subscription="pending"/></pubsub></iq>'));
    this.Subscribable.subscribe('/');
    Assert.areSame(true, pendingFlag,
                   'Was not pending trying to subscribe.');
  },

  testFiresSubscribedWithIQ: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, subscribedFlag = false;
    this.Subscribable.registerHandler('onSubscribed', function () {
      subscribedFlag = true;
    });
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="/" jid="mock@example.com" subscription="subscribed"/></pubsub></iq>'));
    this.Subscribable.subscribe('/', {
      onSuccess: function (requestedURI, finalURI, packet) {
        successFlag = true;
      }
    });
    Assert.areSame(true, successFlag,
                   'Was not successful trying to subscribe.');
    Assert.areSame(true, subscribedFlag,
                   'Was not subscribed trying to subscribe.');
  },

  testFiresSubscribedWithIQNoCallbacks: function () {
    var Assert = YAHOO.util.Assert;

    var subscribedFlag = false;
    this.Subscribable.registerHandler('onSubscribed', function () {
      subscribedFlag = true;
    });
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="/" jid="mock@example.com" subscription="subscribed"/></pubsub></iq>'));
    this.Subscribable.subscribe('/');
    Assert.areSame(true, subscribedFlag,
                   'Was not subscribed trying to subscribe.');
  },

  testFollowSubscribeRedirect: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="error" id="test"><subscribe node="/" jid="mock@example.com"/><error type="modify"><redirect xmlns="urn:ietf:params:xml:ns:xmpp-stanzas">xmpp:pubsub.example.com?;node=other-node</redirect></error></iq>'));
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="result" id="test"><subscription node="other-node" jid="mock@example.com" subscription="subscribed"/></iq>'));
    this.Subscribable.subscribe('/', {
      onSuccess: function (requestedURI, finalURI, packet) {
        successFlag = true;
        Assert.isObject(packet, 'packet in handler is not an object.');
        Assert.areSame('xmpp:pubsub@example.com?;node=/',
                       requestedURI.toString(),
                       'requestedURI is not actual requested uri.');
        Assert.areSame('xmpp:pubsub@example.com?;node=other-node',
                       finalURI.toString(),
                       'finalURI is not actual final uri.');
      },

      onError: function () {
        errorFlag = true;
      }
    });

    Assert.areSame(false, errorFlag,
                   'Got error trying to subscribe.');
    Assert.areSame(true, successFlag,
                   'Was not successful trying to subscribe.');
  },

  testFollowsUpToFiveRedirects: function () {
    var Assert = YAHOO.util.Assert;

    for (var i = 0; i < 5; i++) {
      this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="error" id="test"><subscribe node="/" jid="mock@example.com"/><error type="modify"><redirect xmlns="urn:ietf:params:xml:ns:xmpp-stanzas">xmpp:pubsub.example.com?;node=other-node</redirect></error></iq>'));
    }
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="/" jid="mock@example.com" subscription="subscribed"/></pubsub></iq>'));

    var successFlag = false, errorFlag = false;
    this.Subscribable.subscribe('/', {
      onSuccess: function (requestedURI, finalURI, packet) {
        successFlag = true;
      },

      onError: function () {
        errorFlag = true;
      }
    });

    Assert.isFalse(errorFlag,
                   'Got error trying to follow 5 redirects.');
    Assert.isTrue(successFlag,
                  'Was successful trying to follow 5 redirects.');
  },

  testOnlyFollowsUpToFiveRedirects: function () {
    var Assert = YAHOO.util.Assert;

    for (var i = 0; i < 6; i++) {
      this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="error" id="test"><subscribe node="/" jid="mock@example.com"/><error type="modify"><redirect xmlns="urn:ietf:params:xml:ns:xmpp-stanzas">xmpp:pubsub.example.com?;node=other-node</redirect></error></iq>'));
    }

    var successFlag = false, errorFlag = false;
    this.Subscribable.subscribe('/', {
      onSuccess: function (requestedURI, finalURI, packet) {
        successFlag = true;
      },

      onError: function () {
        errorFlag = true;
      }
    });

    Assert.isFalse(successFlag,
                   'Was successful trying to follow 6 redirects.');
    Assert.isTrue(errorFlag,
                  'Did not get error trying to follow 6 redirects.');
  },

  testFiresPendingWithIQRedirect: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false, pendingFlag = false;
    this.Subscribable.registerHandler('onPending', function () {
      pendingFlag = true;
    });
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="error" id="test"><subscribe node="/" jid="mock@example.com"/><error type="modify"><redirect xmlns="urn:ietf:params:xml:ns:xmpp-stanzas">xmpp:pubsub.example.com?;node=other-node</redirect></error></iq>'));
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="result" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="other-node" jid="mock@example.com" subscription="pending"/></iq>'));

    this.Subscribable.subscribe('/', {
      onSuccess: function (requestedURI, finalURI, packet) {
        successFlag = true;
      },

      onError: function () {
        errorFlag = true;
      }
    });

    Assert.isFalse(errorFlag,
                   'Got error trying to subscribe.');
    Assert.isTrue(successFlag,
                  'Was not successful trying subscribe.');
    Assert.isTrue(pendingFlag,
                  'Did not get pending trying to subscribe.');
  },

  testFiresSubscribedWithIQRedirect: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false, subscribedFlag = false;
    this.Subscribable.registerHandler('onSubscribed', function () {
      subscribedFlag = true;
    });
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="error" id="test"><subscribe node="/" jid="mock@example.com"/><error type="modify"><redirect xmlns="urn:ietf:params:xml:ns:xmpp-stanzas">xmpp:pubsub.example.com?;node=other-node</redirect></error></iq>'));
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="result" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="other-node" jid="mock@example.com" subscription="subscribed"/></iq>'));

    this.Subscribable.subscribe('/', {
      onSuccess: function (requestedURI, finalURI, packet) {
        successFlag = true;
      },

      onError: function () {
        errorFlag = true;
      }
    });

    Assert.isFalse(errorFlag,
                   'Got error trying to subscribe.');
    Assert.isTrue(successFlag,
                  'Was not successful trying subscribe.');
    Assert.isTrue(subscribedFlag,
                  'Did not get subscribed trying to subscribe.');
  },

  testPublishHandler: function () {
    var Assert = YAHOO.util.Assert;

    var packet = OXTest.Packet.extendWithXML('<message from="pubsub@example.com" to="mock@example.com"><event xmlns="http://jabber.org/protocol/pubsub#event"><items node="/"><item id="item1"><foo>bar</foo></item><item id="item2"><foo>baz</foo></item></items></event></message>');

    var publishCount = 0;
    this.Subscribable.registerHandler('onPublish', function (item) {
      publishCount++;
      Assert.areSame('item', item, 'Item is not coerced for publish handler.');
    });

    this.conn.fireEvent('message', packet);
    Assert.areSame(2, publishCount, 'Wrong number of items when publishing.');
  },

  testRetractHandler: function () {
    var Assert = YAHOO.util.Assert;

    var retractFlag = false;
    this.Subscribable.registerHandler('onRetract', function (uri) {
      retractFlag = true;
      Assert.isObject(uri, 'URI in retract handler is not an object.');
      Assert.areSame('xmpp:pubsub@example.com?;node=/;item=item',
                     uri.toString(),
                     'Retract item URI is wrong.');
    });
    var packet = OXTest.Packet.extendWithXML('<message from="pubsub@example.com" to="mock@example.com"><event xmlns="http://jabber.org/protocol/pubsub#event"><items node="/"><retract id="item"/></items></event></message>');
    this.conn.fireEvent('message', packet);
    Assert.isTrue(retractFlag, 'Retract handler did not fire.');
  },

  testGetItemsSuccess: function () {
    var Assert = YAHOO.util.Assert;

    var packet = OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="result" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><items node="/"><item id="item1"><foo>bar</foo></item><item id="item2"><foo>baz</foo></item></items></pubsub></iq>');
    this.conn.addResponse(packet);

    var successFlag = false, errorFlag = false;
    this.Subscribable.getItems('/', {
      onSuccess: function (items) {
        successFlag = true;
        Assert.areSame(2, items.length,
                       'Wrong number of items passed to success handler.');
        Assert.areSame('item', items[0],
                       'Item was not translated in success handler.');
        Assert.areSame('item', items[1],
                       'Item was not translated in success handler.');
      },

      onError: function (error) {
        errorFlag = true;
      }
    });

    Assert.isGetItems(this.conn._data, 'pubsub@example.com', '/');
    Assert.isFalse(errorFlag, 'Got error trying to fetch items.');
    Assert.isTrue(successFlag, 'Did not get success trying to fetch items.');
  },

  testGetItemsError: function () {
    var Assert = YAHOO.util.Assert;

    var packet = OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="error" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><items node="/"/></pubsub><error type="cancel"><bad-request xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/><invalid-jid xmlns="http://jabber.org/protocol/pubsub#errors"/></error></iq>');
    this.conn.addResponse(packet);

    var successFlag = false, errorFlag = false;
    this.Subscribable.getItems('/', {
      onSuccess: function (items) {
        successFlag = true;
      },

      onError: function (error) {
        errorFlag = true;
        Assert.areSame(packet, error, 'Error packet does not match.');
      }
    });

    Assert.isGetItems(this.conn._data, 'pubsub@example.com', '/');
    Assert.isFalse(successFlag, 'Was successful trying to fetch items.');
    Assert.isTrue(errorFlag, 'Did not error trying to fetch items.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Subscribable);
