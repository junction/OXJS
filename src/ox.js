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

OX.Mixins = {};
OX.Mixins.InDialog = {
  transfer: function () {}
};
OX.Mixins.PreDialog = {
  hangup: function () {}
};
OX.Mixins.CallLabeler = {
  label: function () {}
};
OX.Mixins.Subscribable = {
  subscribe: function () {},
  unsubscribe: function () {},
  getItems: function () {}
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