/**
 * Connection object to use for all OXJS connections.
 * The connection MUST have a valid connectionAdapter to function.
 *
 * @class
 * @extends OX.Base
 * @property {OX.Service.Auth} Auth#
 * @property {OX.Service.Auth} ActiveCalls#
 * @property {OX.Service.Auth} UserAgents#
 * @property {OX.Service.Auth} Voicemail#
 * @property {OX.Service.Auth} Directories#
 * @property {OX.Service.Auth} Preferences#
 * @property {OX.Service.Auth} RecentCalls#
 */
OX.Connection = OX.Base.extend(/** @lends OX.Connection# */{

  /**
   * Map of instance names to instance objects.
   * They are instantiated on extend time when a
   * connectionAdapter is provided.
   */
  services: {
    Auth:        OX.Service.Auth,
    ActiveCalls: OX.Service.ActiveCalls,
    Directories: OX.Service.Directories,
    Preferences: OX.Service.Preferences,
    RecentCalls: OX.Service.RecentCalls,
    UserAgents:  OX.Service.UserAgents,
    Voicemail:   OX.Service.Voicemail,
    Rosters:     OX.Service.Rosters
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
   * Initialize the Connection with Services hooked up
   * with a connection and then stuck on the top level namespace.
   * @private
   */
  init: function ($super) {
    if (this.connectionAdapter) {
      if (!this.getJID() || this.getJID() === '') {
        throw new OX.Error('missing JID');
      }

      var serviceMap = {};

      for (var s in this.services) {
        if (this.services.hasOwnProperty(s)) {
          var service = this.services[s];

          this[s] = service.extend({connection: this});
          if (service.pubSubURI) {
            serviceMap[service.pubSubURI] = service;
          }
        }
      }

      // Register for incoming messages.
      var that = this;
      this.connectionAdapter.registerHandler('message', function (msg) {
        var from = msg.getFrom(),
            fn = that.jidHandlers[from];
        if (fn) {
          fn(msg);
        }
      });
    }

    if ($super instanceof Function) {
      $super();
    }
  }.around(),

  /**
   * Sends an XML string to the connection adapter.
   *
   * @param {String} xml The XML String to send.
   * @param {Function} callback Called when a response to this packet is received with the first argument being the received packet.
   * @param {Array} [args] An array of arguments to be passed to callback after the packet.
   *
   * @see OX.ConnectionAdapter#send
   */
  send: function (xml, callback, args) {
    this.connectionAdapter.send(xml, callback, args || []);
  },

  /**
   * Returns the JID of this connection.
   *
   * @example
   * ox.getJID();
   *
   * @returns {String} This connection's JID.
   *
   * @see OX.ConnectionAdapter#jid
   */
  getJID: function () {
    return this.connectionAdapter.jid();
  },

  /**
   * Registers a message event handler for a JID. Only one
   * handler is active at a time per JID.
   *
   * @example
   * var ox = OX.Connection.extend({ connectionAdapter: bosh });
   * ox.registerJIDHandler('pubsub.active-calls.xmpp.onsip.com', function (packet) {
   *   ...
   * });
   *
   * @param {String} jid The jid who's events we listen to.
   * @param {Function} handler Function of one argument: the message packet received.
   * @return {OX.Connection} The receiver.
   *
   * @see OX.Connection#registerJIDHandler
   * @see OX.ConnectionAdapter#registerHandler
   */
  registerJIDHandler: function (jid, handler) {
    this.jidHandlers[jid] = handler;
    return this;
  },

  /**
   * Unregister the handler, if any, for a JID.
   *
   * @example
   * var ox = OX.Connection.extend({ connectionAdapter: bosh });
   * ox.unregisterJIDHandler('pubsub.active-calls.xmpp.onsip.com');
   *
   * @param {String} jid The jid who's events we listen to.
   * @return {OX.Connection} The receiver.
   *
   * @see OX.Connection#unregisterJIDHandler
   * @see OX.ConnectionAdapter#unregisterHandler
   */
  unregisterJIDHandler: function (jid) {
    delete this.jidHandlers[jid];
    return this;
  }
});
