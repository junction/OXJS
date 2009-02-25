/* Main application namespace. */
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
  }
});

/**
 * Traits object for URI.
 */
OX.URI.Base = OX.Base.extend({
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
   * @param callbacks an object supplying functions for 'onPending', 'onSuccess', and 'onError'
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
  getItems: function (node, callbacks) {}
};

OX.Auth = OX.Base.extend({});
OX.ActiveCalls = OX.Base.extend({});
OX.UserAgents = OX.Base.extend({});
OX.Voicemail = OX.Base.extend({});
OX.Directories = OX.Base.extend({});
OX.Preferences = OX.Base.extend({});
OX.RecentCalls = OX.Base.extend({});

OX.Item = OX.Base.extend({
  uri: null
});