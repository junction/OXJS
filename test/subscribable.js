OXTest.Subscribable = new YAHOO.tool.TestCase({
  name: 'Subscribable Mixin Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connectionAdapter: this.conn});

    var that = this;
    var itemFromElement = function () {
      return that.itemFromElement.apply(that, arguments);
    };

    this.Subscribable = OX.Base.extend(OX.Mixin.Subscribable, {
      connection:      this.ox,
      pubSubURI:       OX.URI.parse('xmpp:pubsub@example.com'),
      itemFromElement: itemFromElement
    });
  },

  itemFromElement: function (element) {
    return OX.Item.extend({name: 'item'});
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
    delete this.Subscribable;
  },

  testGetSubscriptions: function() {
    var Assert = YAHOO.util.Assert,
        ObjAssert = YAHOO.util.ObjectAssert;

    var successFlag = false, errorFlag = false;

    this.conn.addResponse(OXTest.Packet.extendWithXML(
                            "<iq type='result'"
                            + "    from='pubsub@example.com'"
                            + "    to='mock@example.com'"
                            + "    id='subscriptions1'>"
                            + "  <pubsub xmlns='http://jabber.org/protocol/pubsub'>"
                            + "    <subscriptions>"
                            + "      <subscription node='node1' jid='mock@example.com' subscription='subscribed'/>"
                            + "      <subscription node='node2' jid='mock@example.com' subscription='subscribed' subid='abc-123'/>"
                            + "      <subscription node='node5' jid='mock@example.com' subscription='unconfigured'/>"
                            + "      <subscription node='node6' jid='mock@example.com' subscription='pending'/>"
                            + "    </subscriptions>"
                            + "  </pubsub>"
                            + "</iq>"));

    this.Subscribable.getSubscriptions({
      onSuccess: function (requestedURI, finalURI, subscriptions, packet) {
        successFlag = true;

        Assert.areEqual('xmpp:pubsub@example.com', requestedURI.toString(), 'requestedURI is wrong');
        Assert.areEqual("xmpp:pubsub@example.com", finalURI.toString(), "finalURI is wrong");

        Assert.isArray(subscriptions, 'subscriptions is not an array');
        Assert.areEqual(4, subscriptions.length, 'subscriptions.length is wrong');

        ObjAssert.propertiesAreEqual({node: 'node1', jid: 'mock@example.com', subscription: 'subscribed', subid: null},
                                     subscriptions[0],
                                     'subscription[0] is incorrect');
        ObjAssert.propertiesAreEqual({node: 'node2', jid: 'mock@example.com', subscription: 'subscribed', subid: 'abc-123'},
                                     subscriptions[1],
                                     'subscription[1] is incorrect');
        ObjAssert.propertiesAreEqual({node: 'node5', jid: 'mock@example.com', subscription: 'unconfigured', subid: null},
                                     subscriptions[2],
                                     'subscription[2] is incorrect');
        ObjAssert.propertiesAreEqual({node: 'node6', jid: 'mock@example.com', subscription: 'pending', subid: null},
                                     subscriptions[3],
                                     'subscription[3] is incorrect');

        Assert.isObject(packet, 'packet in success handler is not an object');
      },
      onError: function(requestedURI, finalURI, packet) {
        errorFlag = true;
      }
    });

    Assert.isTrue(successFlag, 'onSuccess handler was not called');
    Assert.isFalse(errorFlag, 'onError handler was called');
  },

  testGetSubscriptionsWithNoSubscriptions: function() {
    var Assert = YAHOO.util.Assert;
    var successFlag = false, errorFlag = false;

    this.conn.addResponse(OXTest.Packet.extendWithXML(
                          "<iq type='result'"
                          + "    from='pubsub@example.com'"
                          + "    to='mock@example.com'"
                          + "    id='subscriptions1'>"
                          + "  <pubsub xmlns='http://jabber.org/protocol/pubsub'>"
                          + "    <subscriptions/>"
                          + "  </pubsub>"
                          + "</iq>"));

    this.Subscribable.getSubscriptions({
      onSuccess: function (requestedURI, finalURI, subscriptions, packet) {
        successFlag = true;

        Assert.isArray(subscriptions, 'subscriptions is not an array');
        Assert.areEqual(0, subscriptions.length, 'subscriptions length is not zero');
      },
      onError: function(requestedURI, finalURI, packet) {
        errorFlag = true;
      }
    });

    Assert.isTrue(successFlag, 'onSuccess handler was not called');
    Assert.isFalse(errorFlag, 'onError handler was called');
  },

  testGetSubscriptionsError: function() {
    var Assert = YAHOO.util.Assert;
    var successFlag = false, errorFlag = false;

    this.conn.addResponse(OXTest.Packet.extendWithXML(
                            "<iq type='error'"
                            + "    from='pubsub@example.com'"
                            + "    to='mock@example.com'"
                            + "    id='subscriptions1'>"
                            + "  <pubsub xmlns='http://jabber.org/protocol/pubsub'>"
                            + "    <subscriptions/>"
                            + "  </pubsub>"
                            + "  <error type='cancel'>"
                            + "    <feature-not-implemented xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/>"
                            + "    <unsupported xmlns='http://jabber.org/protocol/pubsub#errors'"
                            + "                 feature='retrieve-subscriptions'/>"
                            + "  </error>"
                            + "</iq>"));

    this.Subscribable.getSubscriptions({
      onSuccess: function (requestedURI, finalURI, subscriptions, packet) {
        successFlag = true;
      },
      onError: function(requestedURI, finalURI, packet) {
        errorFlag = true;

        Assert.areEqual("xmpp:pubsub@example.com", requestedURI.toString(), "requestedURI is wrong");
        Assert.areEqual("xmpp:pubsub@example.com", finalURI.toString(), "finalURI is wrong");
        Assert.isObject(packet, "packet is not an object");
      }
    });

    Assert.isFalse(successFlag, 'onSuccess handler was called');
    Assert.isTrue(errorFlag, 'onError handler was not called');
  },

  testGetSubscriptionsPerNode: function() {
    var Assert = YAHOO.util.Assert;
    var successFlag = false, errorFlag = false;

    this.conn.addResponse(OXTest.Packet.extendWithXML(
                          "<iq type='result'"
                          + "    from='pubsub@example.com'"
                          + "    to='mock@example.com'"
                          + "    id='subscriptions1'>"
                          + "  <pubsub xmlns='http://jabber.org/protocol/pubsub'>"
                          + "    <subscriptions node='princely_musings'>"
                          + "      <subscription jid='mock@example.com' subscription='subscribed' subid='123-abc'/>"
                          + "      <subscription jid='mock@example.com' subscription='subscribed' subid='004-yyy'/>"
                          + "    </subscriptions>"
                          + "  </pubsub>"
                          + "</iq>"));

    this.Subscribable.getSubscriptions('princely_musings', {
      onSuccess: function (requestedURI, finalURI, subscriptions, packet) {
        successFlag = true;

        Assert.isArray(subscriptions, 'subscriptions is not an array');
        Assert.areEqual(2, subscriptions.length, 'subscriptions length is not two');
        Assert.areEqual('xmpp:pubsub@example.com?;node=princely_musings',
                        requestedURI.toString(),
                        'requestedURI is incorrect');
        Assert.areEqual('xmpp:pubsub@example.com?;node=princely_musings',
                        finalURI.toString(),
                       'finalURI is incorrect');
      },
      onError: function(requestedURI, finalURI, packet) {
        errorFlag = true;
      }
    });

    Assert.isTrue(successFlag, 'onSuccess handler was not called');
    Assert.isFalse(errorFlag, 'onError handler was called');
  },

  testGetSubscriptionsWithoutStrictJIDCheck: function() {
    /** start this test setup **/
    var resourceConn = OXTest.ConnectionMock.extend({jid: function() { return 'mock@example.com/brooklyn'; }}).init();
        resourceOx = OX.Connection.extend({connectionAdapter: resourceConn});

    var itemFromElement = function () {
      return that.itemFromElement.apply(that, arguments);
    };

    var resourceSubscribable = OX.Base.extend(OX.Mixin.Subscribable, {
      connection:     resourceOx,
      pubSubURI:      OX.URI.parse('xmpp:pubsub@example.com'),
      itemFromElement: itemFromElement
    });
    /** end this test setup **/

    var Assert = YAHOO.util.Assert;
    var successFlag = false, errorFlag = false;

    resourceConn.addResponse(OXTest.Packet.extendWithXML(
                             "<iq type='result'"
                             + "    from='pubsub@example.com'"
                             + "    to='mock@example.com/brooklyn'"
                             + "    id='subscriptions1'>"
                             + "  <pubsub xmlns='http://jabber.org/protocol/pubsub'>"
                             + "    <subscriptions node='princely_musings'>"
                             + "      <subscription jid='mock@example.com' subscription='subscribed' subid='bare-123'/>"
                             + "      <subscription jid='mock@example.com/brooklyn' subscription='subscribed' subid='123-abc'/>"
                             + "      <subscription jid='mock@example.com/manhattan' subscription='subscribed' subid='004-yyy'/>"
                             + "    </subscriptions>"
                             + "  </pubsub>"
                             + "</iq>"));

    resourceSubscribable.getSubscriptions('princely_musings', {
      onSuccess: function (requestedURI, finalURI, subscriptions, packet) {
        successFlag = true;

        Assert.isArray(subscriptions, 'subscriptions is not an array');
        Assert.areEqual(3, subscriptions.length, 'subscriptions length should be three');
      },
      onError: function(requestedURI, finalURI, packet) {
        errorFlag = true;
      }
    });

    Assert.isTrue(successFlag, 'onSuccess handler was not called');
    Assert.isFalse(errorFlag, 'onError handler was called');
  },

  testGetSubscriptionsWithStrictJIDCheck: function() {
    /** start this test setup **/
    var resourceConn = OXTest.ConnectionMock.extend({jid: function() { return 'mock@example.com/brooklyn'; }}).init();
        resourceOx = OX.Connection.extend({connectionAdapter: resourceConn});

    var itemFromElement = function () {
      return that.itemFromElement.apply(that, arguments);
    };

    var resourceSubscribable = OX.Base.extend(OX.Mixin.Subscribable, {
      connection:     resourceOx,
      pubSubURI:      OX.URI.parse('xmpp:pubsub@example.com'),
      itemFromElement: itemFromElement
    });
    /** end this test setup **/

    var Assert = YAHOO.util.Assert;
    var successFlag = false, errorFlag = false;

    resourceConn.addResponse(OXTest.Packet.extendWithXML(
                             "<iq type='result'"
                             + "    from='pubsub@example.com'"
                             + "    to='mock@example.com/brooklyn'"
                             + "    id='subscriptions1'>"
                             + "  <pubsub xmlns='http://jabber.org/protocol/pubsub'>"
                             + "    <subscriptions node='princely_musings'>"
                             + "      <subscription jid='mock@example.com' subscription='subscribed' subid='bare-123'/>"
                             + "      <subscription jid='mock@example.com/brooklyn' subscription='subscribed' subid='123-abc'/>"
                             + "      <subscription jid='mock@example.com/manhattan' subscription='subscribed' subid='004-yyy'/>"
                             + "    </subscriptions>"
                             + "  </pubsub>"
                             + "</iq>"));

    resourceSubscribable.getSubscriptions('princely_musings', {
      onSuccess: function (requestedURI, finalURI, subscriptions, packet) {
        successFlag = true;

        Assert.isArray(subscriptions, 'subscriptions is not an array');
        Assert.areEqual(1, subscriptions.length, 'subscriptions length should be one');

        Assert.areEqual('mock@example.com/brooklyn', subscriptions[0].jid, 'strict match subscription has incorrect JID');
        Assert.areEqual('123-abc', subscriptions[0].subid, 'strict match subscription has incorrect subid');
        Assert.areEqual('subscribed', subscriptions[0].subscription, 'strict match subscription has incorrect subscription');
      },
      onError: function(requestedURI, finalURI, packet) {
        errorFlag = true;
      }
    }, true);

    Assert.isTrue(successFlag, 'onSuccess handler was not called');
    Assert.isFalse(errorFlag, 'onError handler was called');
  },

  testConfigureNode: function() {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    this.conn.addResponse(OXTest.Packet.extendWithXML(
                          "<iq type='result'"
                          + "    from='pubsub@example.com'"
                          + "    to='mock@example.com'"
                          + "    id='options2'/>"));

    var sub = { node: '/', jid: 'mock@example.com', subid: 'abc-123', subscription: 'subscribed' },
        options = { expire: new Date(3009, 0, 1, 12, 0, 0), subscription_depth: 'all', subscription_type: 'items' },
        callbacks = {
          onSuccess: function(packet) {
            successFlag = true;
            Assert.isObject(packet, 'packet is not an object');
          },
          onError: function(packet) {
            errorFlag = true;
          }
        };

    this.Subscribable.configureNode(sub, options, callbacks);

    Assert.isConfigure(this.conn._data, 'pubsub@example.com', '/', 'mock@example.com', 'abc-123', options);

    Assert.isTrue(successFlag, 'sucess handler was not called');
    Assert.isFalse(errorFlag, 'error handler was called');
  },

  testConfigureNodeError: function() {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    this.conn.addResponse(OXTest.Packet.extendWithXML(
                          "<iq type='error'"
                          + "    from='pubsub@example.com'"
                          + "    to='mock@example.com'"
                          + "    id='unsub1'>"
                          + "  <pubsub xmlns='http://jabber.org/protocol/pubsub'>"
                          + "     <unsubscribe"
                          + "         node='princely_musings'"
                          + "         subid='abc-123'"
                          + "         jid='mock@example.com'/>"
                          + "  </pubsub>"
                          + "  <error type='modify'>"
                          + "    <not-acceptable xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/>"
                          + "    <invalid-subid xmlns='http://jabber.org/protocol/pubsub#errors'/>"
                          + "  </error>"
                          + "</iq>"));

    var sub = { node: '/', jid: 'mock@example.com', subid: 'abc-123', subscription: 'subscribed' },
        options = { expire: new Date(3009, 0, 1, 12, 0, 0), subscription_depth: 'all', subscription_type: 'items' },
        callbacks = {
          onSuccess: function(packet) {
            successFlag = true;
          },
          onError: function(packet) {
            errorFlag = true;
            Assert.isObject(packet, 'packet is not an object');
          }
        };

    this.Subscribable.configureNode(sub, options, callbacks);

    Assert.isFalse(successFlag, 'sucess handler was called');
    Assert.isTrue(errorFlag, 'error handler was not called');
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

  testSubscribesWithFullJID: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.jid = function () { return 'mock@example.com/test'; };
    this.Subscribable.subscribe('/');
    Assert.isSubscribe(this.conn._data, 'pubsub@example.com', '/',
                       'mock@example.com/test');
  },

  testSubscribeWithOptions: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false,
        options = {expire:             new Date(2009, 5, 8, 1, 20, 10, 708),
                   subscription_depth: 'all',
                   subscription_type:  'items'};
    this.Subscribable.subscribe('/', options, {
      onSuccess: function () {
        successFlag = true;
      },

      onError: function (requestedURI, finalURI, packet) {
        errorFlag = true;
      }
    });

    Assert.isSubscribe(this.conn._data, 'pubsub@example.com', '/',
                       'mock@example.com',
                       {expire:             '2009-06-08T05:20:10.0708000Z',
                        subscription_depth: 'all',
                        subscription_type:  'items'});
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
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="result" id="test"></iq>'));
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

  testMultipleServiceSubscriptionHandlers: function() {
    var Assert = YAHOO.util.Assert;

    var that = this;
    var itemFromElement = function () {
      return that.itemFromElement.apply(that, arguments);
    };

    var subscribableService2 = OX.Base.extend(OX.Mixin.Subscribable, {
      connection:     this.ox,
      pubSubURI:      OX.URI.parse('xmpp:pubsub2@example.com'),
      itemFromElement: itemFromElement
    });

    Assert.areNotSame(subscribableService2._subscriptionHandlers,
                      this.Subscribable._subscriptionHandlers,
                     'subscribableService2 has identical _subscriptionHandlers');
  },

  testMultipleServiceRegisterHandler: function() {
    var Assert = YAHOO.util.Assert;

    var that = this;
    var itemFromElement = function () {
      return that.itemFromElement.apply(that, arguments);
    };

    var subscribableService2 = OX.Base.extend(OX.Mixin.Subscribable, {
      connection:     this.ox,
      pubSubURI:      OX.URI.parse('xmpp:pubsub2@example.com'),
      itemFromElement: itemFromElement
    });

    Assert.isObject(this.ox.jidHandlers['pubsub@example.com'], 'this.Subscribable is not registered');
    Assert.isObject(this.ox.jidHandlers['pubsub2@example.com'], 'subscribableService2 is not registered');
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

  testFiresUnsubscribedWithEvent: function () {
    var Assert = YAHOO.util.Assert;

    var packet = OXTest.Packet.extendWithXML('<message from="pubsub@example.com" to="mock@example.com"><event xmlns="http://jabber.org/protocol/pubsub#event"><subscription node="/" jid="mock@example.com" subscription="none"/></event></message>');

    var unsubscribedFlag = false;
    this.Subscribable.registerHandler('onUnsubscribed', function (uri) {
      unsubscribedFlag = true;
      Assert.areSame('xmpp:pubsub@example.com?;node=/', uri.toString(),
                     'Requested URI for subscribed is wrong.');
    });
    this.Subscribable.subscribe('/');

    this.conn.fireEvent('message', packet);
    Assert.areSame(true, unsubscribedFlag,
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

  testFiresSubscribedWithIQNoReturnedNode: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, subscribedFlag = false;
    this.Subscribable.registerHandler('onSubscribed', function (uri) {
      subscribedFlag = true;
      Assert.areSame('xmpp:pubsub@example.com?;node=/', uri.toString(),
                     'uri is not actual requested uri.');
    });
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription jid="mock@example.com" subscription="subscribed"/></pubsub></iq>'));
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

  testFiresUnsubscribedWithIQ: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, unsubscribedFlag = false;
    this.Subscribable.registerHandler('onUnsubscribed', function () {
      unsubscribedFlag = true;
    });
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="/" jid="mock@example.com" subscription="none"/></pubsub></iq>'));
    this.Subscribable.subscribe('/', {
      onSuccess: function (requestedURI, finalURI, packet) {
        successFlag = true;
      }
    });
    Assert.areSame(true, successFlag,
                   'Was not successful trying to subscribe.');
    Assert.areSame(true, unsubscribedFlag,
                   'Was not subscribed trying to subscribe.');
  },

  testFiresUnsubscribedWithIQNoCallbacks: function () {
    var Assert = YAHOO.util.Assert;

    var unsubscribedFlag = false;
    this.Subscribable.registerHandler('onUnsubscribed', function () {
      unsubscribedFlag = true;
    });
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="/" jid="mock@example.com" subscription="none"/></pubsub></iq>'));
    this.Subscribable.subscribe('/');
    Assert.areSame(true, unsubscribedFlag,
                   'Was not subscribed trying to subscribe.');
  },

  testFollowSubscribeRedirect: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false;
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="error" id="test"><subscribe node="/" jid="mock@example.com"/><error type="modify"><redirect xmlns="urn:ietf:params:xml:ns:xmpp-stanzas">xmpp:pubsub.example.com?;node=other-node</redirect></error></iq>'));
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="result" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="other-node" jid="mock@example.com" subscription="subscribed"/></pubsub></iq>'));
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
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="result" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="other-node" jid="mock@example.com" subscription="pending"/></pubsub></iq>'));

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
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="result" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="other-node" jid="mock@example.com" subscription="subscribed"/></pubsub></iq>'));

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

  testFiresUnsubscribedWithIQRedirect: function () {
    var Assert = YAHOO.util.Assert;

    var successFlag = false, errorFlag = false, unsubscribedFlag = false;
    this.Subscribable.registerHandler('onUnsubscribed', function () {
      unsubscribedFlag = true;
    });
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="error" id="test"><subscribe node="/" jid="mock@example.com"/><error type="modify"><redirect xmlns="urn:ietf:params:xml:ns:xmpp-stanzas">xmpp:pubsub.example.com?;node=other-node</redirect></error></iq>'));
    this.conn.addResponse(OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="result" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscription node="other-node" jid="mock@example.com" subscription="none"/></pubsub></iq>'));

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
    Assert.isTrue(unsubscribedFlag,
                  'Did not get unsubscribed trying to subscribe.');
  },

  testPublishHandler: function () {
    var Assert = YAHOO.util.Assert;

    var packet = OXTest.Packet.extendWithXML('<message from="pubsub@example.com" to="mock@example.com"><event xmlns="http://jabber.org/protocol/pubsub#event"><items node="/"><item id="item1"><foo publish-time="2009-11-23T23:28:22Z">bar</foo></item><item id="item2"><foo publish-time="2009-11-23T23:28:22Z">baz</foo></item></items></event></message>');

    var publishCount = 0,
        items = [];
    this.Subscribable.registerHandler('onPublish', function (item) {
      publishCount++;
      Assert.areSame('item', item.name, 'Item is not coerced for publish handler.');
      items.push(item);
    });

    this.conn.fireEvent('message', packet);

    Assert.isObject(items[0].uri, "Item1 URI is not an OX.URI object");
    Assert.isObject(items[1].uri, "Item2 URI is not an OX.URI object");

    Assert.areSame('xmpp:pubsub@example.com?;node=/;item=item1',
                   items[0].uri.toString(),
                   'Item1 URI has an incorrect value');
    Assert.areSame('xmpp:pubsub@example.com?;node=/;item=item2',
                   items[1].uri.toString(),
                   'Item2 URI has an incorrect value');

    Assert.areSame(2, publishCount, 'Wrong number of items when publishing.');
  },

  /*
   * Ejabberd sends headers at the front of the payload, which appears
   * to be legal.
   */
  testPublishWithLeadingHeaders: function () {
    var Assert = YAHOO.util.Assert;

    var packet = OXTest.Packet.extendWithXML('<message from="pubsub@example.com" to="mock@example.com"><headers xmlns="http://jabber.org/protocol/shim"><header name="Collection">rootnode</header></headers><event xmlns="http://jabber.org/protocol/pubsub#event"><items node="/"><item id="item1"><foo publish-time="2009-11-23T23:28:22Z">bar</foo></item></items></event></message>');
    var publishCount = 0,
        items = [];
    this.Subscribable.registerHandler('onPublish', function (item) {
      publishCount++;
      items.push(item);
    });

    this.conn.fireEvent('message', packet);
    Assert.areSame(1, publishCount, 'Wrong number of items when publishing.');
    Assert.areSame('xmpp:pubsub@example.com?;node=/;item=item1',
                   items[0].uri.toString(),
                   'Item1 URI has an incorrect value');
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

  testRetractWithLeadingHeaders: function () {
    var Assert = YAHOO.util.Assert;

    var retractFlag = false;
    this.Subscribable.registerHandler('onRetract', function (uri) {
      retractFlag = true;
      Assert.isObject(uri, 'URI in retract handler is not an object.');
      Assert.areSame('xmpp:pubsub@example.com?;node=/;item=item',
                     uri.toString(),
                     'Retract item URI is wrong.');
    });
    var packet = OXTest.Packet.extendWithXML('<message from="pubsub@example.com" to="mock@example.com"><headers xmlns="http://jabber.org/protocol/shim"><header name="Collection">rootnode</header></headers><event xmlns="http://jabber.org/protocol/pubsub#event"><items node="/"><retract id="item"/></items></event></message>');
    this.conn.fireEvent('message', packet);
    Assert.isTrue(retractFlag, 'Retract handler did not fire.');
  },

  testGetItemsSuccess: function () {
    var Assert = YAHOO.util.Assert;

    var packet = OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="result" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><items node="/"><item id="item1"><foo publish-time="2009-11-23T23:28:22Z">bar</foo></item><item id="item2"><foo publish-time="2009-11-23T23:28:22Z">baz</foo></item></items></pubsub></iq>');
    this.conn.addResponse(packet);

    var successFlag = false, errorFlag = false;
    this.Subscribable.getItems('/', {
      onSuccess: function (items) {
        successFlag = true;
        Assert.areSame(2, items.length,
                       'Wrong number of items passed to success handler.');

        Assert.areSame('item', items[0].name,
                       'Item was not translated in success handler.');
        Assert.areSame('item', items[1].name,
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
  },

  testGetCollectionItems: function () {
    var Assert = YAHOO.util.Assert;

    var packet = OXTest.Packet.extendWithXML('<iq from="pubsub@example.com" to="mock@example.com" type="result" id="test"><pubsub xmlns="http://jabber.org/protocol/pubsub"><items node="node1"><item id="item1"><foo publish-time="2009-11-23T23:28:22Z">bar</foo></item><item id="item2"><foo publish-time="2009-11-23T23:28:22Z">baz</foo></item></items><items node="node2"><item id="node2-item1"><foo publish-time="2009-11-23T23:28:22Z">baz</foo></item><item id="node2-item2"><bar>baz</bar></item></items></pubsub></iq>');
    this.conn.addResponse(packet);

    var successFlag = false, errorFlag = false;
    this.Subscribable.getItems('/', {
      onSuccess: function (items) {
        successFlag = true;
        Assert.areSame(4, items.length);

        Assert.areSame('2009-11-23T23:28:22Z', items[0].publishTime, 'item.publishTime is incorrect');
        Assert.areSame('2009-11-23T23:28:22Z', items[1].publishTime, 'item.publishTime is incorrect');

        Assert.areSame('xmpp:pubsub@example.com?;node=node1;item=item1',
                       items[0].uri.toString());
        Assert.areSame('xmpp:pubsub@example.com?;node=node1;item=item2',
                       items[1].uri.toString());
        Assert.areSame('xmpp:pubsub@example.com?;node=node2;item=node2-item1',
                       items[2].uri.toString());
        Assert.areSame('xmpp:pubsub@example.com?;node=node2;item=node2-item2',
                       items[3].uri.toString());
      },

      onError: function (error) {
        errorFlag = true;
      }
    });
    Assert.isFalse(errorFlag, 'Got error trying to fetch items.');
    Assert.isTrue(successFlag, 'Did not get success trying to fetch items.');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Subscribable);
