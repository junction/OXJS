OXTest.ActiveCalls = new YAHOO.tool.TestCase({
  name: 'ActiveCalls Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connection: this.conn});
    this.ox.initConnection();
    this.ActiveCalls = this.ox.ActiveCalls;

    this.successFlag = false;
    this.errorFlag = false;
  },

  tearDown: function () {
    delete this.ox;
    delete this.ActiveCalls;
    delete this.successFlag;
    delete this.errorFlag;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Services.ActiveCalls,
                    'ActiveCalls mixin is not available');
    Assert.isObject(this.ActiveCalls, 'ActiveCalls is not initialized');
    Assert.areSame(this.conn,         this.ox.ActiveCalls.connection);
  },

  testPubSubURI: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame('xmpp:pubsub.active-calls.xmpp.onsip.com',
                   this.ActiveCalls.pubSubURI,
                   'ActiveCalls.pubSubURI is wrong.');
  },

  testCommandURIs: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(this.ActiveCalls.commandURIs,
                    'ActiveCalls.commandURIs is not an object.');
    Assert.areSame('xmpp:commands.active-calls.xmpp.onsip.com?;node=transfer',
                   this.ActiveCalls.commandURIs.transfer,
                   'ActiveCalls.commandURIs.transfer is wrong');
    Assert.areSame('xmpp:commands.active-calls.xmpp.onsip.com?;node=create',
                   this.ActiveCalls.commandURIs.create,
                   'ActiveCalls.commandURIs.create is wrong');
    Assert.areSame('xmpp:commands.active-calls.xmpp.onsip.com?;node=terminate',
                   this.ActiveCalls.commandURIs.hangup,
                   'ActiveCalls.commandURIs.hangup is wrong');
  },

  testSubscribe: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.subscribe,
                      'ActiveCalls.subscribe is not a function.');

    this.ActiveCalls.subscribe('/me/jid', {
      onSucess: function (requestedURI, finalURI) {
        this.successFlag = true;
        Assert.areSame(requestedURI, finalURI,
                       'requested and final uri differ when successful.');
        Assert.areSame('/me/jid', requestedURI,
                       'requestedURI is not actual requested uri');
      },

      onError: function (requestedURI, finalURI) {
        this.errorFlag = true;
        Assert.areSame(requestedURI, finalURI,
                       'requested and final uri differ on error.');
        Assert.areSame('/me/jid', requestedURI,
                       'requestedURI is not actual requested uri');
      }
    });

    Assert.isSubscribe(this.conn._data, 'pubsub.active-calls.xmpp.onsip.com',
                       '/', 'test@example.com');
    Assert.areSame(false, this.errorFlag,
                   'Got error trying to subscribe to /');
    Assert.areSame(true,  this.successFlag,
                   'Was not successful trying to subscribe to /');
  },

  testUnsubscribe: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.unsubscribe,
                      'ActiveCalls.unsubscribe is not a function.');

    this.ActiveCalls.unsubscribe('/me/jid', {
      onSucess: function (requestedURI, finalURI) {
        this.successFlag = true;
        Assert.areSame(requestedURI, finalURI,
                       'requested and final uri differ when successful.');
        Assert.areSame('/me/jid', requestedURI,
                       'requestedURI is not actual requested uri');
      },

      onError: function (requestedURI, finalURI) {
        this.errorFlag = true;
        Assert.areSame(requestedURI, finalURI,
                       'requested and final uri differ on error.');
        Assert.areSame('/me/jid', requestedURI,
                       'requestedURI is not actual requested uri');
      }
    });

    Assert.isUnsubscribe(this.conn._data, 'pubsub.active-calls.xmpp.onsip.com',
                         '/', 'test@example.com');
    Assert.areSame(false, this.errorFlag,
                   'Got error trying to unsubscribe to /');
    Assert.areSame(true,  this.successFlag,
                   'Was not successful trying to unsubscribe to /');
  },

  testGetItems: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.getItems,
                      'ActiveCalls.getItems is not a function.');

    this.ActiveCalls.getItems('/me/jid', {
      onSucess: function (items) {
        this.successFlag = true;
        Assert.areSame(requestedURI, finalURI,
                       'requested and final uri differ when successful.');
        Assert.areSame('/me/jid', requestedURI,
                       'requestedURI is not actual requested uri');
      },

      onError: function (error) {
        this.errorFlag = true;
        Assert.areSame(requestedURI, finalURI,
                       'requested and final uri differ on error.');
        Assert.areSame('/me/jid', requestedURI,
                       'requestedURI is not actual requested uri');
      }
    });

    Assert.isGetItems(this.conn._data, 'pubsub.active-calls.xmpp.onsip.com', '/');
    Assert.areSame(false, this.errorFlag,
                   'Got error trying to get items on /');
    Assert.areSame(true,  this.successFlag,
                   'Was not successful trying to get items on /');
  },

  testPendingHandler: function () {
    var Assert = YAHOO.util.Assert;

    var pendingFired = false;
    this.ActiveCalls.registerHandler({
      onPending: function (requestedURI, finalURI) { pendingFired = true; }
    });
    Assert.isTrue(pendingFired, 'pending subscription handler did not fire.');
  },

  testSubscribedHandler: function () {
    var Assert = YAHOO.util.Assert;

    var subscribedFired = false;
    this.ActiveCalls.registerHandler({
      onSubscribed: function (requestedURI, finalURI) { subscribedFired = true; }
    });
    Assert.isTrue(subscribedFired, 'subscribed subscription handler did not fire.');
  },

  testPublishHandler: function () {
    var Assert = YAHOO.util.Assert;

    var publishFired = false;
    this.ActiveCalls.registerHandler({
      onPublish: function (item) { publishFired = true; }
    });
    Assert.isTrue(publishFired, 'publish subscription handler did not fire.');
  },

  testRetractHandler: function () {
    var Assert = YAHOO.util.Assert;

    var retractFired = false;
    this.ActiveCalls.registerHandler({
      onRetract: function (uri) { retractFired = true; }
    });
    Assert.isTrue(retractFired, 'retract subscription handler did not fire.');
  },

  testUnregisterHandler: function () {
    var Assert = YAHOO.util.Assert;

    var pendingFired    = false,
        subscribedFired = false,
        publishFired    = false,
        retractFired    = false;

    var pendingHandler    = function () { pendingFired    = true; };
    var subscribedHandler = function () { subscribedFired = true; };
    var publishHandler    = function () { publishFired    = true; };
    var retractHandler    = function () { retractFired    = true; };

    this.ActiveCalls.registerHandler({onPending:    pendingHandler,
                                      onSubscribed: subscribedHandler,
                                      onPublish:    publishHandler,
                                      onRetract:    retractHandler});

    Assert.isFunction(this.ActiveCalls.unregisterHandler,
                      'ActiveCalls.unregisterHandler is not a function.');
    this.ActiveCalls.unregisterHandler({onPending:    pendingHandler,
                                        onSubscribed: subscribedHandler,
                                        onPublish:    publishHandler,
                                        onRetract:    retractHandler});

    Assert.isFalse(pendingFired,    'pending subscription handler fired.');
    Assert.isFalse(subscribedFired, 'subscribed subscription handler fired.');
    Assert.isFalse(publishFired,    'publish subscription handler fired.');
    Assert.isFalse(retractFired,    'retract subscription handler fired.');
  },

  testItemConnection: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(this.ActiveCalls.Item,
                    'ActiveCalls.Item is not an object');
    Assert.areSame(this.conn, this.ActiveCalls.Item.connection,
                   'ActiveCalls.Item connection is wrong.');
  },

  testCreate: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.create,
                      'ActiveCalls.create is not a function.');

    this.ActiveCalls.create('to@example.com', 'from@example.com');

    Assert.isCommand(this.conn._data, 'commands.active-calls.xmpp.onsip.com',
                     'create', {to:   'to@example.com',
                                from: 'from@example.com'});
  },


  testHangup: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.Item.hangup,
                      'ActiveCalls.Item.hangup is not a function');

    var item = this.ActiveCalls.Item.extend({callID:  '123',
                                             fromTag: 'alice@example.com',
                                             toTag:   'bob@example.com'});
    Assert.isFunction(item.hangup,
                      'active call item\'s hangup is not a function');
    item.hangup();
    Assert.isCommand(this.conn._data, 'commands.active-calls.xmpp.onsip.com',
                     'hangup', {'call-id':  '123',
                                'to-tag':   'alice@example.com',
                                'from-tag': 'bob@example.com'});
  },

  testTransfer: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.Item.transfer,
                      'ActiveCalls.Item.transfer is not a function');

    var item = this.ActiveCalls.Item.extend({callID:  '123',
                                             fromTag: 'alice@example.com',
                                             toTag:   'bob@example.com'});
    Assert.isFunction(item.transfer,
                      'active call item\'s transfer is not a function');
    item.transfer('transfer@example.com');
    Assert.isCommand(this.conn._data, 'commands.active-calls.xmpp.onsip.com',
                     'transfer', {'to-address': 'transfer@example.onsip.com',
                                  'call-id':    '123',
                                  'to-tag':     'alice@example.com',
                                  'from-tag':   'bob@example.com'});
  },

  testLabel: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.ActiveCalls.Item.label,
                      'ActiveCalls.Item.label is not a function');

    var item = this.ActiveCalls.Item.extend({callID:  '123'});
    Assert.isFunction(item.label,
                      'active call item\'s label is not a function');
    item.label('wauug');
    Assert.isCommand(this.conn._data, 'commands.recent-calls.xmpp.onsip.com',
                     'label', {'call-id': '123',
                               'label':   'wauug'});
  },

  testDialogState: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.dialogState,
                          'ActiveCalls.Item.dialogState is undefined');
  },

  testCallID: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.callID,
                          'ActiveCalls.Item.callID is undefined');
  },

  testFromURI: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.fromURI,
                          'ActiveCalls.Item.fromURI is undefined');
  },

  testToURI: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.toURI,
                          'ActiveCalls.Item.toURI is undefined');
  },

  testUACAOR: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.uacAOR,
                          'ActiveCalls.Item.uacAOR is undefined');
  },

  testUASAOR: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.uasAOR,
                          'ActiveCalls.Item.uasAOR is undefined');
  },

  testFromTag: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.fromTag,
                          'ActiveCalls.Item.fromTag is undefined');
  },

  testToTag: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.ActiveCalls.Item.toTag,
                          'ActiveCalls.Item.toTag is undefined');
  }
});

YAHOO.tool.TestRunner.add(OXTest.ActiveCalls);
