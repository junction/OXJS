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
 * @requires connection property which is an OX.ConnectionAdapter object on receiving object.
 * @requires pubSubURI The URI of the PubSub service.
 */
OX.Mixins.Subscribable = /** @lends OX.Mixins.Subscribable# */{
  /**
   * Subscribe to +node+
   *
   * @public
   * @param {String} node The node ID to subscribe to
   * @param {Function} callbacks an object supplying functions for 'onSuccess', and 'onError'
   *
   * @example
   * service.subscribe('/', {
   *   onSuccess: function (requestedURI, finalURI) {},
   *   onError:   function (requestedURI, finalURI) {}
   * });
   */
  subscribe: function (node, callbacks) {},

  /**
   * Unsubscribe from +node+
   *
   * @public
   * @param {String} node The node ID to subscribe to
   * @param {Object} callbacks an object supplying functions for 'onSuccess', and 'onError'
   *
   * @example
   * service.unsubscribe('/', {
   *   onSuccess: function (uri) {},
   *   onError:   function (uri) {}
   * });
   */
  unsubscribe: function (node, callbacks) {},

  /**
   * Get the items on +node+
   *
   * @public
   * @param {String} node The node ID to subscribe to
   * @param {Object} callbacks an object supplying functions for 'onSuccess', and 'onError'
   *
   * @example
   * service.getItems('/', {
   *   onSuccess: function (items) {},
   *   onError:   function (errorPacket) {}
   * });
   */
  getItems: function (node, callbacks) {},

  /**
   * Registers +handler+ for +event+.
   *
   * Only one handler can be registered for a given event at a time.
   *
   * @public
   * @param {String} event One of the strings 'onPending', 'onSubscribed', 'onPublish' or 'onRetract'.
   * @param {Function} handler A function which accepts one argument, which is the packet response.
   *
   * @example
   * service.registerHandler('onPublish', function (item) {});
   */
  registerHandler: function (event, handler) {
  },

  /**
   * Unregisters +handler+ for +event+.
   *
   * @public
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
