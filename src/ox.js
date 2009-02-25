/**
 * Main application namespace.
 */
var OX = {};

/**
 * Base object for OXJS. All other objects inherit from this one.
 */
OX.Base = {
  /**
   * Creates a new object which extends the current object.  Any
   * arguments are mixed in to the new object as if +OX.Base.extend+ was
   * called on the new object with remaining args.
   *
   * @return the new object
   */
  extend: function () {
    var F = function () {};
    F.prototype = this;

    var rc = new F();
    rc.mixin.apply(rc, arguments);

    return rc;
  },

  /**
   * Iterates over all arguments, adding their own properties to the
   * receiver.
   *
   * @return the receiver
   */
  mixin: function () {
    for (var i = 0, len = arguments.length; i < len; i++) {
      for (var k in arguments[i]) if (arguments[i].hasOwnProperty(k)) {
        this[k] = arguments[i][k];
      }
    }

    return this;
  }
};

/**
 * OX Connection Adapter abstract object.
 */
OX.ConnectionAdapter = OX.Base.extend({
  /**
   * Sends +xml+ to +this.connection+.
   *
   * @param xml The XML String to send.
   * @param callback Called when a response to this packet is received with the first argument being the received packet.
   * @param args An array of arguments to be passed to callback after the packet.
   */
  send: function (xml, callback, args) {},

  /**
   * Registers +handler+ for +event+.
   *
   * @param event One of the strings 'onPublish' or 'onRetract'.
   * @param handler A function which accepts one argument, which is the packet response.
   */
  registerHandler: function (event, handler) {},

  /**
   * Unregisters +handler+ for +event+.
   *
   * @param event One of the strings 'onPublish' or 'onRetract'.
   * @param handler A handler registered for +event+.
   */
  unregisterHandler: function (event, handler) {}
});

/**
 * URI namespace.
 */
OX.URI = OX.Base.extend({
  /**
   * Parse +string+ as a URI.
   *
   * @param string The URI to parse
   * @return A new URI object
   */
  parse: function (string) {
    return OX.URI.Base.extend();
  },

  /**
   * Convert +object+ into a URI.
   *
   * @param object
   */
  fromObject: function (object) {
    return OX.URI.Base.extend(object);
  }
});

/**
 * Traits object for URI.
 */
OX.URI.Base = OX.Base.extend({
  /**
   * The URI scheme.
   */
  scheme: null,

  /**
   * The URI authority section.
   */
  authority: null,

  /**
   * The URI path.
   */
  path: null,

  /**
   * The URI query parameters.
   */
  query: null,

  /**
   * The URI fragment identifier.
   */
  fragment: null,

  /**
   * Convert URI object to string representation.
   */
  toString: function () {
    return 'XXX - Not implemented';
  }
});

/**
 * Connection object to use for all OXJS connections. The +initServices+
 * method MUST be called after extending this object.
 */
OX.Connection = OX.Base.extend({
  /**
   * Initialize the service properties.
   */
  initServices: function () {
    this.Auth        = OX.Auth.extend({connection: this.connection});
    this.ActiveCalls = OX.ActiveCalls.extend({connection: this.connection});
    this.UserAgents  = OX.UserAgents.extend({connection: this.connection});
    this.Voicemail   = OX.Voicemail.extend({connection: this.connection});
    this.Directories = OX.Directories.extend({connection: this.connection});
    this.Preferences = OX.Preferences.extend({connection: this.connection});
    this.RecentCalls = OX.RecentCalls.extend({connection: this.connection});

    return this;
  }
});

/**
 * Mixins namespace.
 */
OX.Mixins = {};

/**
 * InDialog mixin.
 *
 * To use this mixin your base object must supply a +callID+ and
 * +toTag+ property.
 */
OX.Mixins.InDialog = {
  /**
   * Transfer a call to +to+.
   *
   * @param to To whom to transfer the active call.
   */
  transfer: function (to) {}
};

/**
 * PreDialog mixin.
 *
 * To use this mixin your base object must supply a +callID+ property.
 */
OX.Mixins.PreDialog = {
  /**
   * Hangup this call.
   */
  hangup: function () {}
};

/**
 * CallLabeler mixin.
 *
 * To use this mixin your base object must supply a +callID+ property.
 */
OX.Mixins.CallLabeler = {
  /**
   * Label a call with a short string.
   *
   * @param label A short string used to label this call.
   */
  label: function (label) {}
};

/**
 * Subscribable mixin.
 *
 * To use this mixin your base object must supply a +pubsubURI+ property.
 */
OX.Mixins.Subscribable = {
  /**
   * Subscribe to +node+
   *
   * @param node The node ID to subscribe to
   * @param callbacks an object supplying functions for 'onSuccess', and 'onError'
   */
  subscribe: function (node, callbacks) {},

  /**
   * Unsubscribe from +node+
   *
   * @param callbacks an object supplying functions for 'onSuccess', and 'onError'
   */
  unsubscribe: function (node, callbacks) {},

  /**
   * Get the items on +node+
   *
   * @param callbacks an object supplying functions for 'onSuccess', and 'onError'
   */
  getItems: function (node, callbacks) {},

  /**
   * Registers +handler+ for +event+.
   *
   * Only one handler can be registered for a given event at a time.
   *
   * @param event One of the strings 'onPending', 'onSubscribed', 'onPublish' or 'onRetract'.
   * @param handler A function which accepts one argument, which is the packet response.
   */
  registerHandler: function (event, handler) {
  },

  /**
   * Unregisters +handler+ for +event+.
   *
   * @param event One of the strings 'onPending', 'onSubscribed', 'onPublish' or 'onRetract'.
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

/**
 * Base Item object.
 */
OX.Item = OX.Base.extend({
  /**
   * The URI of this item.
   */
  uri: null
});

/**
 * Namespace for auth related services.
 */
OX.Auth = OX.Base.extend({});

/**
 * Namespace for active-calls related services.
 */
OX.ActiveCalls = OX.Base.extend(OX.Mixins.Subscribable, {
  /**
   * URI for this PubSub service.
   */
  pubSubURI: 'xmpp:pubsub.active-calls.xmpp.onsip.com',

  commandURIs: {
    /**
     * URI for create Ad Hoc commnd.
     */
    create: 'xmpp:commands.active-calls.xmpp.onsip.com?;node=create',

    /**
     * URI for transfer Ad Hoc commnd.
     */
    transfer: 'xmpp:commands.active-calls.xmpp.onsip.com?;node=transfer',

    /**
     * URI for hangup Ad Hoc commnd.
     */
    hangup: 'xmpp:commands.active-calls.xmpp.onsip.com?;node=terminate'
  },

  /**
   * Active Call Item.
   */
  Item: OX.Item.extend(OX.Mixins.InDialog, OX.Mixins.PreDialog, OX.Mixins.CallLabeler, {
    dialogState: null,
    callID: null,
    fromURI: null,
    toURI: null,
    uacAOR: null,
    uasAOR: null,
    fromTag: null,
    toTag: null
  }),

  /**
   * Create a new call.
   */
  create: function () {}
});

/**
 * Namespace for user agent related services.
 */
OX.UserAgents = OX.Base.extend({});

/**
 * Namespace for voicemail related services.
 */
OX.Voicemail = OX.Base.extend({});

/**
 * Namespace for directory related services.
 */
OX.Directories = OX.Base.extend({});

/**
 * Namespace for preference related services.
 */
OX.Preferences = OX.Base.extend({});

/**
 * Namespace for recent call related services.
 */
OX.RecentCalls = OX.Base.extend({});
