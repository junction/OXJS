/**
 * Mixins namespace.
 * @namespace
 */
OX.Mixins = {};

/**
 * CallDialog mixin.
 *
 * To use this mixin your base object must supply a +callID+ property
 * @namespace
 * @requires callID property on receiving object.
 * @requires fromTag property on receiving object.
 * @requires toTag property on receiving object.
 */
OX.Mixins.CallDialog = /** @lends OX.Mixins.CallDialog# */{
  /**
   * Transfer a call to +to+.
   * @param {String} to To whom to transfer the active call.
   *
   * @example
   * call.transfer('lisa@example.com');
   */
  transfer: function (to) {},

  /**
   * Hangup this call.
   *
   * @example
   * call.hangup();
   */
  hangup: function () {}
};

/**
 * CallLabeler mixin.
 *
 * To use this mixin your base object must supply a +callID+ property.
 * @namespace
 * @requires callID property on receiving object.
 */
OX.Mixins.CallLabeler = /** @lends OX.Mixins.CallLabeler# */{
  /**
   * Label a call with a short string.
   *
   * @param {String} label A short string used to label this call.
   *
   * @example
   * call.label('alice');
   */
  label: function (label) {}
};

/**
 * Subscribable mixin.
 *
 * @namespace
 * @requires connection A property which is an OX.ConnectionAdapter object on receiving object.
 * @requires pubSubURI The URI of the PubSub service.
 * @requires itemFromPacket A function which takes a packet argument and returns an item.
 */
OX.Mixins.Subscribable = function () {
  function getURI () {
    if (arguments.callee._cached === undefined) {
      arguments.callee._cached = OX.URI.parse(this.pubSubURI);
    }
    return arguments.callee._cached;
  };

  function packetType (element) {
    switch (element.tagName) {
    case 'subscription':
      return element.getAttribute('subscription');
    case 'items':
      if (element.firstChild.tagName === 'retract')
        return 'retract';
      else
        return 'publish';
    default:
      return undefined;
    }
  }

  function fireEvent (type, packet) {
    switch (type) {
    case 'subscribed':
      if (this._subscriptionHandlers.onSubscribed)
        this._subscriptionHandlers.onSubscribed('XXX - requested', 'XXX - final');
      break;
    case 'pending':
      if (this._subscriptionHandlers.onPending)
        this._subscriptionHandlers.onPending('XXX - requested', 'XXX - final');
      break;
    case 'publish':
      if (this._subscriptionHandlers.onPublish)
        this._subscriptionHandlers.onPublish('XXX - item');
      break;
    case 'retract':
      if (this._subscriptionHandlers.onRetract)
        this._subscriptionHandlers.onRetract('XXX - item uri');
      break;
    }
  }

  function jidHandler (packet) {
    var event = packet.getDoc().getElementsByTagName('event')[0];
    if (!event)
      return;

    fireEvent.call(this, packetType(event.firstChild), packet);
  }

  function subscriptionHandler (packet, node, callbacks) {
    callbacks = callbacks || {};

    if (!packet)
      return;

    var reqURI = getURI().extend({query: ';node=' + node});
    if (packet.getType() === 'error') {
      if (callbacks.onError) {
        callbacks.onError(reqURI, reqURI, packet);
      }
    } else {
      if (callbacks.onSuccess) {
        callbacks.onSuccess(reqURI, reqURI, packet);

        var pubSub = packet.getDoc().getElementsByTagName('pubsub')[0];
        if (pubSub) {
          fireEvent.call(this, packetType(pubSub.firstChild), packet);
        }
      }
    }
  }

  function getItemsHandler (packet, callbacks) {
    callbacks = callbacks || {};

    if (!packet)
      return;

    if (packet.getType() === 'error') {
      if (callbacks.onError) {
        callbacks.onError(packet);
      }
    } else {
      if (callbacks.onSuccess) {
        var items = [];
        var psItems = packet.getDoc().getElementsByTagName('items');

        for (var i = 0, len = psItems.length; i < len; i++) {
          items.push(this.itemFromPacket(psItems[i]));
        }
        callbacks.onSuccess(items);
      }
    }
  }

  return /** @lends OX.Mixins.Subscribable# */{
    /**
     * Subscribe to +node+
     *
     * @param {String} node The node ID to subscribe to
     * @param {Function} callbacks an object supplying functions for 'onSuccess', and 'onError'
     *
     * @example
     * service.subscribe('/', {
     *   onSuccess: function (requestedURI, finalURI) {},
     *   onError:   function (requestedURI, finalURI) {}
     * });
     */
    subscribe: function (node, callbacks) {
      var iq        = OX.XMPP.IQ.extend(),
          pubsub    = OX.XML.Element.extend({name:  'pubsub',
                                             xmlns: 'http://jabber.org/protocol/pubsub'}),
          subscribe = OX.XML.Element.extend({name: 'subscribe'});

      iq.to(getURI.call(this).path);
      iq.type('set');
      subscribe.attr('node', node);
      subscribe.attr('jid', this.connection.getJID());
      iq.addChild(pubsub.addChild(subscribe));

      var that = this;
      var cb = function () { subscriptionHandler.apply(that, arguments); };
      this.connection.send(iq.toString(), cb, [node, callbacks]);
    },

    /**
     * Unsubscribe from +node+
     *
     * @param {String} node The node ID to subscribe to
     * @param {Object} callbacks an object supplying functions for 'onSuccess', and 'onError'
     *
     * @example
     * service.unsubscribe('/', {
     *   onSuccess: function (uri) {},
     *   onError:   function (uri) {}
     * });
     */
    unsubscribe: function (node, callbacks) {
      var iq          = OX.XMPP.IQ.extend(),
          pubsub      = OX.XML.Element.extend({name:  'pubsub',
                                               xmlns: 'http://jabber.org/protocol/pubsub'}),
          unsubscribe = OX.XML.Element.extend({name: 'unsubscribe'});

      iq.to(getURI.call(this).path);
      iq.type('set');
      unsubscribe.attr('node', node);
      unsubscribe.attr('jid',  this.connection.getJID());
      iq.addChild(pubsub.addChild(unsubscribe));

      var that = this;
      var cb = function () { subscriptionHandler.apply(that, arguments); };
      this.connection.send(iq.toString(), cb, [node, callbacks]);
    },

    /**
     * Get the items on +node+
     *
     * @param {String} node The node ID to subscribe to
     * @param {Object} callbacks an object supplying functions for 'onSuccess', and 'onError'
     *
     * @example
     * service.getItems('/', {
     *   onSuccess: function (items) {},
     *   onError:   function (errorPacket) {}
     * });
     */
    getItems: function (node, callbacks) {
      var iq     = OX.XMPP.IQ.extend(),
          pubsub = OX.XML.Element.extend({name:  'pubsub',
                                          xmlns: 'http://jabber.org/protocol/pubsub'}),
          items  = OX.XML.Element.extend({name: 'items'});

      iq.to(getURI.call(this).path);
      iq.type('get');
      items.attr('node', node);
      iq.addChild(pubsub.addChild(items));

      var that = this;
      var cb = function () { getItemsHandler.apply(that, arguments); };
      this.connection.send(iq.toString(), cb, [callbacks]);
    },

    /**
     * Registers appropriate handlers with the connection for
     * pubSubJID. This should be called after mixin.
     *
     * service.registerSubscriptionHandlers();
     */
    registerSubscriptionHandlers: function () {
      var uri = getURI.call(this);
      var that = this;
      var handler = function () { jidHandler.apply(that, arguments); };
      this.connection.registerJIDHandler(uri.path, handler);
    },

    /**
     * Registers +handler+ for +event+.
     *
     * Only one handler can be registered for a given event at a time.
     *
     * @param {String} event One of the strings 'onPending', 'onSubscribed', 'onPublish' or 'onRetract'.
     * @param {Function} handler A function which accepts one argument, which is the packet response.
     *
     * @example
     * service.registerHandler('onPublish', function (item) {});
     */
    registerHandler: function (event, handler) {
      this._subscriptionHandlers[event] = handler;
    },

    /**
     * Unregisters +handler+ for +event+.
     *
     * @param {String} event One of the strings 'onPending', 'onSubscribed', 'onPublish' or 'onRetract'.
     *
     * @example
     * service.unregisterHandler('onPublish', handlerFunction);
     */
    unregisterHandler: function (event) {
    },

    /**
     * Turn a packet into an item for this service. By default, this
     * does nothing. You must override this within the object being
     * extended for useful behavior.
     */
    itemFromPacket: function (packet) {},

    /**
     * Handlers for various subscription related events.
     *
     * @private
     */
    _subscriptionHandlers: {
      /**
       * This handler is called when we get a pending subscription
       * notification.
       *
       * @param requestedURI The original URI of the subscription request.
       * @param finalURI The final URI of the subscription request, after redirects.
       */
      onPending: function (requestedURI, finalURI) {},

      /**
       * This handler is called when we get a completed subscription.
       *
       * @param requestedURI The original URI of the subscription request.
       * @param finalURI The final URI of the subscription request, after redirects.
       */
      onSubscribed: function (requestedURI, finalURI) {},

      /**
       * This handler is called when we our subscription is removed.
       *
       * @param nodeURI The node we were unsubscribed from.
       */
      onUnsubscribed: function (nodeURI) {},

      /**
       * This handler is called when an item is published.
       *
       * @param item The published item.
       */
      onPublish: function (item) {},

      /**
       * This handler is called when an item is retracted.
       *
       * @param itemURI The URI of the retracted item.
       */
      onRetract: function (itemURI) {}
    }
  };
}();