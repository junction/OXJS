/**
 * @namespace
 */
var OX = {};

/**
 * Base object for OXJS. All other objects inherit from this one.
 * @class
 */
OX.Base = {
  /**
   * Creates a new object which extends the current object.  Any
   * arguments are mixed in to the new object as if +OX.Base.extend+ was
   * called on the new object with remaining args.
   *
   * @return the new object
   * @type OX.Base
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
 * @class
 * @extends OX.Base
 */
OX.ConnectionAdapter = OX.Base.extend(/** @lends OX.ConnectionAdapter */{
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
 * @class
 * @extends OX.Base
 */
OX.URI = OX.Base.extend(/** @lends OX.URI */{
  /**
   * Parse +string+ as a URI.
   *
   * @param string The URI to parse
   * @return A new URI object
   * @type OX.URI.Base
   */
  parse: function (string) {
    return OX.URI.Base.extend();
  },

  /**
   * Convert +object+ into a URI.
   *
   * @param object
   * @return A new URI object
   * @type OX.URI.Base
   */
  fromObject: function (object) {
    return OX.URI.Base.extend(object);
  }
});

/**
 * Traits object for URI.
 * @class
 * @extends OX.Base
 */
OX.URI.Base = OX.Base.extend(/** @lends OX.URI.Base */{
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
 * Connection object to use for all OXJS connections. The +initConnection+
 * method MUST be called after extending this object.
 * @class
 * @extends OX.Base
 * @property {OX.Auth} Auth
 * @property {OX.ActiveCalls} ActiveCalls
 * @property {OX.UserAgents} UserAgents
 * @property {OX.Voicemail} Voicemail
 * @property {OX.Directories} Directories
 * @property {OX.Preferences} Preferences
 * @property {OX.RecentCalls} RecentCalls
 */
OX.Connection = OX.Base.extend(/** @lends OX.Connection */{
  /**
   * Initialize the service properties.
   */
  initConnection: function () {
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
 * @namespace
 */
OX.Mixins = {};

/**
 * CallDialog mixin.
 *
 * To use this mixin your base object must supply a +callID+ property
 * @type Object
 */
OX.Mixins.CallDialog = {
  /**
   * Transfer a call to +to+.
   *
   * @param to To whom to transfer the active call.
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
 * @type Object
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
 * @type Object
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

/**
 * Base Item object.
 * @class
 * @extends OX.Base
 */
OX.Item = OX.Base.extend(/** @lends OX.Item */{
  /**
   * The URI of this item as an OX.URI.Base object.
   */
  uri: null
});

/**
 * Namespace for auth related services.
 * @class
 * @extends OX.Base
 */
OX.Auth = OX.Base.extend({});

/**
 * Namespace for active-calls related services.
 * @class
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable.subscribe as subscribe
 * @borrows OX.Mixins.Subscribable.unsubscribe as unsubscribe
 * @borrows OX.Mixins.Subscribable.getItems as getItems
 * @borrows OX.Mixins.Subscribable.registerHandler as registerHandler
 * @borrows OX.Mixins.Subscribable.unregisterHandler as unregisterHandler
 */
OX.ActiveCalls = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.ActiveCalls */ {
  /**
   * URI for this PubSub service.
   */
  pubSubURI: 'xmpp:pubsub.active-calls.xmpp.onsip.com',

  /** @field */
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
   * @name OX.ActiveCalls.Item
   * @class
   * @extends OX.Item
   * @borrows OX.Mixins.CallDialog.transfer as transfer
   * @borrows OX.Mixins.CallDialog.hangup as hangup
   * @borrows OX.Mixins.CallLabeler.label as label
   */
  Item: OX.Item.extend(OX.Mixins.CallDialog, OX.Mixins.CallLabeler, /** @lends OX.ActiveCalls.Item */{
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
 * @class
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable.subscribe as subscribe
 * @borrows OX.Mixins.Subscribable.unsubscribe as unsubscribe
 * @borrows OX.Mixins.Subscribable.getItems as getItems
 * @borrows OX.Mixins.Subscribable.registerHandler as registerHandler
 * @borrows OX.Mixins.Subscribable.unregisterHandler as unregisterHandler
 */
OX.UserAgents = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.UserAgents */{});

/**
 * Namespace for voicemail related services.
 * @class
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable.subscribe as subscribe
 * @borrows OX.Mixins.Subscribable.unsubscribe as unsubscribe
 * @borrows OX.Mixins.Subscribable.getItems as getItems
 * @borrows OX.Mixins.Subscribable.registerHandler as registerHandler
 * @borrows OX.Mixins.Subscribable.unregisterHandler as unregisterHandler
 */
OX.Voicemail = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Voicemail */{});

/**
 * Namespace for directory related services.
 * @class
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable.subscribe as subscribe
 * @borrows OX.Mixins.Subscribable.unsubscribe as unsubscribe
 * @borrows OX.Mixins.Subscribable.getItems as getItems
 * @borrows OX.Mixins.Subscribable.registerHandler as registerHandler
 * @borrows OX.Mixins.Subscribable.unregisterHandler as unregisterHandler
 */
OX.Directories = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Directories */{});

/**
 * Namespace for preference related services.
 * @class
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable.subscribe as subscribe
 * @borrows OX.Mixins.Subscribable.unsubscribe as unsubscribe
 * @borrows OX.Mixins.Subscribable.getItems as getItems
 * @borrows OX.Mixins.Subscribable.registerHandler as registerHandler
 * @borrows OX.Mixins.Subscribable.unregisterHandler as unregisterHandler
 */
OX.Preferences = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Preferences */{});

/**
 * Namespace for recent call related services.
 * @class
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable.subscribe as subscribe
 * @borrows OX.Mixins.Subscribable.unsubscribe as unsubscribe
 * @borrows OX.Mixins.Subscribable.getItems as getItems
 * @borrows OX.Mixins.Subscribable.registerHandler as registerHandler
 * @borrows OX.Mixins.Subscribable.unregisterHandler as unregisterHandler
 */
OX.RecentCalls = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.RecentCalls */{});
