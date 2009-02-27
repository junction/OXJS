/**
 * @namespace
 */
var OX = {};

/**
 * Base object for OXJS. All other objects inherit from this one.
 * @namespace
 */
OX.Base = {
  /**
   * Creates a new object which extends the current object.  Any
   * arguments are mixed in to the new object as if +OX.Base.extend+ was
   * called on the new object with remaining args.
   *
   * @returns {OX.Base} the new object
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
   * @returns {OX.Base} the receiver
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
 *
 * @example
 * var conn = new JSJaCConnection();
 * var adapter = OX.ConnectionAdapter.extend({
 *   registerHandler: function (event, handler) {
 *     return conn.registerHandler(event, handler);
 *   },
 *
 *   unregisterHandler: function (event, handler) {
 *     return conn.unregisterHandler(event, handler);
 *   },
 *
 *   send: function (xml, cb, args) {
 *     return conn._sendRaw(xml, cb, args);
 *   }
 * });
 *
 * var tmp = OX.Connection.extend({connection: adapter});
 *
 * @namespace
 * @extends OX.Base
 */
OX.ConnectionAdapter = OX.Base.extend(/** @lends OX.ConnectionAdapter# */{
  /**
   * Sends +xml+ to +this.connection+.
   *
   * @param {String} xml The XML String to send.
   * @param {Function} callback Called when a response to this packet is received with the first argument being the received packet.
   * @param {Array} args An array of arguments to be passed to callback after the packet.
   */
  send: function (xml, callback, args) {},

  /**
   * Registers +handler+ for +event+.
   *
   * @param {String} event One of the strings 'onPublish' or 'onRetract'.
   * @param {Function} handler A function which accepts one argument, which is the packet response.
   */
  registerHandler: function (event, handler) {},

  /**
   * Unregisters +handler+ for +event+.
   *
   * @param {String} event One of the strings 'onPublish' or 'onRetract'.
   * @param {Function} handler A handler registered for +event+.
   */
  unregisterHandler: function (event, handler) {}
});

/**
 * URI namespace.
 * @namespace
 * @extends OX.Base
 */
OX.URI = OX.Base.extend(/** @lends OX.URI */{
  /**
   * Parse +string+ as an OX.URI.Base object.
   *
   * @param {String} uriString the URI to parse
   * @returns {OX.URI.Base} A new OX.URI.Base object
   */
  parse: function (uriString) {
    return OX.URI.Base.extend();
  },

  /**
   * Convert +object+ into an OX.URI.Base object
   *
   * @param {Object} object an object with these members: scheme, path, authority, query, fragment
   * @returns {OX.URI.Base} A new URI object
   */
  fromObject: function (object) {
    return OX.URI.Base.extend(object);
  }
});

/**
 * Traits object for URI.
 * @namespace
 * @extends OX.Base
 */
OX.URI.Base = OX.Base.extend(/** @lends OX.URI.Base# */{
  /**
   * The URI scheme.
   * @public
   */
  scheme: null,

  /**
   * The URI authority section.
   * @public
   */
  authority: null,

  /**
   * The URI path.
   * @public
   */
  path: null,

  /**
   * The URI query parameters.
   * @public
   */
  query: null,

  /**
   * The URI fragment identifier.
   * @public
   */
  fragment: null,

  /**
   * Convert URI object to string representation.
   * @public
   */
  toString: function () {
    return 'XXX - Not implemented';
  }
});

/**
 * Connection object to use for all OXJS connections. The +initConnection+
 * method MUST be called after extending this object.
 *
 * @class
 * @extends OX.Base
 */
OX.Connection = OX.Base.extend(/** @lends OX.Connection# */{
  /**
   * Initialize the service properties.
   */
  initConnection: function () {
    /** @type OX.Auth */
    this.Auth        = OX.Auth.extend({connection: this.connection});

    /** @type OX.ActiveCalls */
    this.ActiveCalls = OX.ActiveCalls.extend({connection: this.connection});

    /** @type OX.UserAgents */
    this.UserAgents  = OX.UserAgents.extend({connection: this.connection});

    /** @type OX.Voicemail */
    this.Voicemail   = OX.Voicemail.extend({connection: this.connection});

    /** @type OX.Directories */
    this.Directories = OX.Directories.extend({connection: this.connection});

    /** @type OX.Preferences */
    this.Preferences = OX.Preferences.extend({connection: this.connection});

    /** @type OX.RecentCalls */
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
 * @namespace
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
 * @namespace
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

/**
 * Base Item object.
 * @namespace
 * @extends OX.Base
 */
OX.Item = OX.Base.extend(/** @lends OX.Item# */{
  /**
   * The URI of this item as an OX.URI.Base object.
   * @type OX.URI.Base
   */
  uri: null
});

/**
 * Namespace for auth related services.
 * @namespace
 * @extends OX.Base
 */
OX.Auth = OX.Base.extend(/** @lends OX.Auth */{
  /**
   * Authenticate +jid+ for +address+ with +password+
   *
   * @param {String} address The SIP address to authenticate as.
   * @param {String} password The web password for +address+.
   * @param {String} [jid] The JID to authorize for +address+. If unspecified, use the current JID.
   */
  authenticatePlain: function (address, password, jid) {
    // TODO: parse this out of commands uri.
    var jidStr = jid ? '<field var="jid"><value>' + jid + '</value></field>' : '';
    var xml = '<iq type="set" to="commands.auth.xmpp.onsip.com"><command xmlns="http://jabber.org/protocol/commands" node="authenticate-plain"><x xmlns="jabber:x:data" type="submit"><field var="sip-address"><value>' + address + '</value></field><field var="password"><value>'+ password +'</value></field>' + jidStr + '</x></command></iq>';

    this.connection.send(xml, function () {}, []);
  }
});

/**
 * Namespace for active-calls related services.
 * @namespace
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable#subscribe as #subscribe
 * @borrows OX.Mixins.Subscribable#unsubscribe as #unsubscribe
 * @borrows OX.Mixins.Subscribable#getItems as #getItems
 * @borrows OX.Mixins.Subscribable#registerHandler as #registerHandler
 * @borrows OX.Mixins.Subscribable#unregisterHandler as #unregisterHandler
 */
OX.ActiveCalls = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.ActiveCalls */ {
  /**
   * URI for this PubSub service.
   */
  pubSubURI: 'xmpp:pubsub.active-calls.xmpp.onsip.com',

  /**
   */
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
   * @namespace
   * @extends OX.Item
   * @borrows OX.Mixins.CallDialog#transfer as #transfer
   * @borrows OX.Mixins.CallDialog#hangup as #hangup
   * @borrows OX.Mixins.CallLabeler#label as #label
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
   *
   * @param {String} to the SIP address to terminate the call at
   * @param {String} from the SIP address to originate the call from
   */
  create: function (to, from) {}
});

/**
 * Namespace for user agent related services.
 * @namespace
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable#subscribe as #subscribe
 * @borrows OX.Mixins.Subscribable#unsubscribe as #unsubscribe
 * @borrows OX.Mixins.Subscribable#getItems as #getItems
 * @borrows OX.Mixins.Subscribable#registerHandler as #registerHandler
 * @borrows OX.Mixins.Subscribable#unregisterHandler as #unregisterHandler
 */
OX.UserAgents = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.UserAgents */{});

/**
 * Namespace for voicemail related services.
 * @namespace
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable#subscribe as #subscribe
 * @borrows OX.Mixins.Subscribable#unsubscribe as #unsubscribe
 * @borrows OX.Mixins.Subscribable#getItems as #getItems
 * @borrows OX.Mixins.Subscribable#registerHandler as #registerHandler
 * @borrows OX.Mixins.Subscribable#unregisterHandler as #unregisterHandler
 */
OX.Voicemail = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Voicemail */{});

/**
 * Namespace for directory related services.
 * @namespace
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable#subscribe as #subscribe
 * @borrows OX.Mixins.Subscribable#unsubscribe as #unsubscribe
 * @borrows OX.Mixins.Subscribable#getItems as #getItems
 * @borrows OX.Mixins.Subscribable#registerHandler as #registerHandler
 * @borrows OX.Mixins.Subscribable#unregisterHandler as #unregisterHandler
 */
OX.Directories = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Directories */{});

/**
 * Namespace for preference related services.
 * @namespace
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable#subscribe as #subscribe
 * @borrows OX.Mixins.Subscribable#unsubscribe as #unsubscribe
 * @borrows OX.Mixins.Subscribable#getItems as #getItems
 * @borrows OX.Mixins.Subscribable#registerHandler as #registerHandler
 * @borrows OX.Mixins.Subscribable#unregisterHandler as #unregisterHandler
 */
OX.Preferences = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Preferences */{});

/**
 * Namespace for recent call related services.
 * @namespace
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable#subscribe as #subscribe
 * @borrows OX.Mixins.Subscribable#unsubscribe as #unsubscribe
 * @borrows OX.Mixins.Subscribable#getItems as #getItems
 * @borrows OX.Mixins.Subscribable#registerHandler as #registerHandler
 * @borrows OX.Mixins.Subscribable#unregisterHandler as #unregisterHandler
 */
OX.RecentCalls = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.RecentCalls */{});
