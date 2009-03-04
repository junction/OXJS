OXTest.Subscribable = new YAHOO.tool.TestCase({
  name: 'Subscribable Mixin Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();

    var that = this;
    var itemFromPacket = function () {
      that.itemFromPacket.apply(that, arguments);
    };

    this.Subscribable = OX.Base.extend(OX.Mixins.Subscribable, {
      connection:     this.ox,
      pubSubURI:      'xmpp:pubsub@example.com',
      itemFromPacket: itemFromPacket
    });
    this.Subscribable.registerSubscriptionHandlers();
  },

  itemFromPacket: function (packet) {
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
    this.conn._response = OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="/" jid="mock@example.com" subscription="subscribed"/></pubsub></iq>');
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
    this.conn._response = OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="error" id="test"><subscribe node="/" jid="mock@example.com"/><error type="cancel"><bad-request xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/><invalid-jid xmlns="http://jabber.org/protocol/pubsub#errors"/></error></iq>');
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
    this.conn._response = OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="result" id="test"/></iq>');
    this.Subscribable.unsubscribe('/', {
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
    this.conn._response = OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="error" id="test"><unsubscribe node="/" jid="mock@example.com"/><error type="cancel"><unexpected-request xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/><not-subscribed xmlns="http://jabber.org/protocol/pubsub#errors"/></error></iq>');
    this.Subscribable.unsubscribe('/', {
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

    Assert.areSame(false,  successFlag,
                   'Was successful trying to unsubscribe.');
    Assert.areSame(true, errorFlag,
                   'Did not get error trying to unsubscribe.');
  },

  testFiresPendingWithEvent: function () { 
    var Assert = YAHOO.util.Assert;

    var pendingFlag = false;
    this.Subscribable.registerHandler('onPending', function () {
      pendingFlag = true;
    });
    this.Subscribable.subscribe('/');

    var packet = OXTest.Packet.extendWithXML('<message from="pubsub@example.com" to="mock@example.com"><event xmlns="http://jabber.org/protocol/pubsub#event"><subscription node="/" jid="mock@example.com" subscription="pending"/></event></message>');
    this.conn.fireEvent('message', packet);
    Assert.areSame(true, pendingFlag,
                   'Did not get pending event trying to subscribe.');
  },

  testFiresSubscribedWithEvent: function () { 
    var Assert = YAHOO.util.Assert;

    var subscribedFlag = false;
    this.Subscribable.registerHandler('onSubscribed', function () {
      subscribedFlag = true;
    });
    this.Subscribable.subscribe('/');

    var packet = OXTest.Packet.extendWithXML('<message from="pubsub@example.com" to="mock@example.com"><event xmlns="http://jabber.org/protocol/pubsub#event"><subscription node="/" jid="mock@example.com" subscription="subscribed"/></event></message>');
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
    this.conn._response = OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="/" jid="mock@example.com" subscription="pending"/></pubsub></iq>');
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

  testFiresSubscribedWithIQ: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, subscribedFlag = false;
    this.Subscribable.registerHandler('onSubscribed', function () {
      subscribedFlag = true;
    });
    this.conn._response = OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="/" jid="mock@example.com" subscription="subscribed"/></pubsub></iq>');
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

  testFollowSubscribeRedirect: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    this.conn._response = OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="error" id="test"><subscribe node="/" jid="mock@example.com"/><error type="modify"><redirect xmlns="urn:ietf:params:xml:ns:xmpp-stanzas">xmpp:pubsub.example.com?;node=other-node</redirect></error></iq>');
    this.Subscribable.subscribe('/', {
      onSuccess: function (requestedURI, finalURI, packet) {
        successFlag = true;
        Assert.isObject(packet, 'packet in handler is not an object.');
        Assert.areSame('xmpp:pubsub@example.com?;node=/',
                       requestedURI.toString(),
                       'requestedURI is not actual requested uri.');
        Assert.areSame('xmpp:pubsub.example.com?;node=other-node',
                       finalURI.toString(),
                       'requested and final uri differ when successful.');
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

  testFiresPendingWithIQRedirect: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isTrue(false, 'Verify that pending IQ responses after a redirect fire properly.');
    var successFlag = false, pendingFlag = false;
    this.Subscribable.registerHandler('onPending', function () {
      pendingFlag = true;
    });
  },

  testFiresSubscribedWithIQRedirect: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isTrue(false, 'Verify that subscribed IQ responses after a redirect fire properly.');
    var successFlag = false, subscribedFlag = false;
    this.Subscribable.registerHandler('onPending', function () {
      subscribedFlag = true;
    });
  },

  testPublishHandler: function () {
    var Assert = YAHOO.util.Assert;

    var publishFlag = false;
    this.Subscribable.registerHandler('onPublish', function () {
      publishFlag = true;
    });
    var packet = OXTest.Packet.extendWithXML('<message from="pubsub@example.com" to="mock@example.com"><event xmlns="http://jabber.org/protocol/pubsub#event"><items node="/"><item id="item"><foo>bar</foo></item></items></event></message>');
    this.conn.fireEvent('message', packet);
    Assert.isTrue(publishFlag, 'Publish handler did not fire.');
  },

  testRetractHandler: function () {
    var Assert = YAHOO.util.Assert;

    var retractFlag = false;
    this.Subscribable.registerHandler('onRetract', function () {
      retractFlag = true;
    });
    var packet = OXTest.Packet.extendWithXML('<message from="pubsub@example.com" to="mock@example.com"><event xmlns="http://jabber.org/protocol/pubsub#event"><items node="/"><retract id="item"/></items></event></message>');
    this.conn.fireEvent('message', packet);
    Assert.isTrue(retractFlag, 'Retract handler did not fire.');
  },

  testGetItemsSuccess: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isTrue(false, 'Verify that get items success handler fires and delivers items.');
  },

  testGetItemsError: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isTrue(false, 'Verify that get items error handler fires and delivers packets.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Subscribable);