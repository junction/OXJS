/**
 * Connection object to use for all OXJS connections. The +initConnection+
 * method MUST be called after extending this object.
 *
 * @class
 * @extends OX.Base
 * @property {OX.Services.Auth} Auth#
 * @property {OX.Services.Auth} ActiveCalls#
 * @property {OX.Services.Auth} UserAgents#
 * @property {OX.Services.Auth} Voicemail#
 * @property {OX.Services.Auth} Directories#
 * @property {OX.Services.Auth} Preferences#
 * @property {OX.Services.Auth} RecentCalls#
 */
OX.Connection = OX.Base.extend(/** @lends OX.Connection# */{
  /**
   * Map of instance names to instance objects. Used during
   * initConnection().
   *
   * @see OX.Connection#initConnection
   */
  services: {
    Auth:        OX.Services.Auth,
    ActiveCalls: OX.Services.ActiveCalls,
    Directories: OX.Services.Directories,
    Preferences: OX.Services.Preferences,
    RecentCalls: OX.Services.RecentCalls,
    UserAgents:  OX.Services.UserAgents,
    Voicemail:   OX.Services.Voicemail
  },

  /**
   * Map of jids to event handler functions. Used when message events
   * are received from the connection.
   *
   * @see OX.Connection#registerJIDHandler
   * @see OX.Connection#unregisterJIDHandler
   */
  jidHandlers: {},

  /**
   * Initialize the service properties.
   *
   * @example
   * var ox = OX.Connection.extend();
   * ox.initConnection();
   *
   * @return {OX.Connection}
   */
  initConnection: function () {
    var serviceMap = {};

    for (var s in this.services) if (this.services.hasOwnProperty(s)) {
      var service = this.services[s];

      this[s] = service.extend({connection: this.connection});
      if (service.pubSubURI) {
        serviceMap[service.pubSubURI] = service;
      }
    }

    // Register for incoming messages.
    var that = this;
    this.connection.registerHandler('message', function (msg) {
      var from = msg.getFrom();
      var fn = that.jidHandlers[from];
      if (fn) {
        fn(msg);
      }
    });

    return this;
  },

  /**
   * Registers a message event handler for a JID. Only one
   * handler is active at a time per JID.
   *
   * @example
   * var ox = OX.Connection.extend().initConnection();
   * ox.registerJIDHandler('pubsub.active-calls.xmpp.onsip.com', function (packet) {
   *   ...
   * });
   *
   * @param {String} jid The jid who's events we listen to.
   * @param {Function} handler Function of one argument: the message packet received.
   * @return {OX.Connection}
   *
   * @see OX.Connection#unregisterJIDHandler
   */
  registerJIDHandler: function (jid, handler) {
    this.jidHandlers[jid] = handler;
    return this;
  },

  /**
   * Unregister the handler, if any, for a JID.
   *
   * @example
   * var ox = OX.Connection.extend().initConnection();
   * ox.unregisterJIDHandler('pubsub.active-calls.xmpp.onsip.com');
   *
   * @param {String} jid The jid who's events we listen to.
   * @return {OX.Connection}
   *
   * @see OX.Connection#registerJIDHandler
   */
  unregisterJIDHandler: function (jid) {
    delete this.jidHandlers[jid];
    return this;
  }
});
