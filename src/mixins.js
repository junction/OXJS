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
 * @requires toTag property on receiving object.
 */
OX.Mixins.CallDialog = /** @lends OX.Mixins.CallDialog# */{
  /**
   * Transfer a call to +to+.
   * @param {String} to To whom to transfer the active call.
   */
  transfer: function (to) {},

  /**
   * Hangup this call.
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
   */
  label: function (label) {}
};

/**
 * Subscribable mixin.
 *
 * To use this mixin your base object must supply a +pubsubURI+ property.
 *
 * @namespace
 * @requires connection property which is an OX.ConnectionAdapter object on receiving object
 */
OX.Mixins.Subscribable = /** @lends OX.Mixins.Subscribable# */{
  /**
   * Subscribe to +node+
   *
   * @public
   * @param {String} node The node ID to subscribe to
   * @param {Function} callbacks an object supplying functions for 'onSuccess', and 'onError'
   */
  subscribe: function (node, callbacks) {},

  /**
   * Unsubscribe from +node+
   *
   * @public
   * @param {String} node The node ID to subscribe to
   * @param {Object} callbacks an object supplying functions for 'onSuccess', and 'onError'
   */
  unsubscribe: function (node, callbacks) {},

  /**
   * Get the items on +node+
   *
   * @public
   * @param {String} node The node ID to subscribe to
   * @param {Object} callbacks an object supplying functions for 'onSuccess', and 'onError'
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
   */
  registerHandler: function (event, handler) {
  },

  /**
   * Unregisters +handler+ for +event+.
   *
   * @public
   * @param {String} event One of the strings 'onPending', 'onSubscribed', 'onPublish' or 'onRetract'.
   */
  unregisterHandler: function (event) {
  },

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
