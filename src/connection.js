/**
 * @class
 * Connection object to use for all OXJS connections.
 * The connection MUST have a valid connectionAdapter to function.
 * The Connection object is the core API for OXJS.
 *
 * The Connection assumes that the consumer understands when
 * to make calls (when the connection is established). This allows
 * you to configure OX at read-time, rather than at run-time.
 *
 * @example
 *   var bosh = new Strophe.Connection('/http-bind/');
 *   var ox = OX.Connection.extend({
 *     connectionAdapter: OX.StropheAdapter.extend({
 *       connection: bosh
 *     })
 *   });
 *
 *   // A naive approach...
 *   bosh.connect("juliet@example.com", "romeo", function (status) {
 *     if (status === Strophe.Status.CONNECTED) {
 *       // OK- OX is ready to go! Let's authenticate...
 *       ox.Auth.authorizePlain("sip@example.com", "password", "jid@example.com", {
 *         onSuccess: function () {
 *           alert("You got the OK to go on ahead!");
 *         }
 *       });
 *     }
 *   });
 *
 * @extends OX.Base
 * @property {OX.Service.Auth} Auth A usable instance of the Auth service.
 * @property {OX.Service.ActiveCalls} ActiveCalls A useable instance of the ActiveCalls service.
 * @property {OX.Service.UserAgents} UserAgents A usable instance of the UserAgents service.
 * @property {OX.Service.Voicemail} Voicemail A usable instance of the Voicemail service.
 * @property {OX.Service.Directories} Directories A usable instance of the Directories service.
 * @property {OX.Service.Preferences} Preferences A usable instance of the Preferences service (not implemented).
 * @property {OX.Service.RecentCalls} RecentCalls A usable instance of the RecentCalls service (not implemented).
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
   * @private
   * Initialize the Connection with Services hooked up
   * with a connection and then stuck on the top level namespace.
   * @param {Function} $super The base init that was implemented under {@link OX.Connection#init}
   * @returns {void}
   */
  init: function ($super) {
    if (this.connectionAdapter) {
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

    $super();
  }.around(),

  /**
   * Sends an XML string to the connection adapter.
   *
   * @param {String} xml The XML String to send.
   * @param {Function} callback Called when a response to this packet is received with the first argument being the received packet.
   * @param {Array} [args] An array of arguments to be passed to callback after the packet.
   * @returns {void}
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
   *   ox.getJID();
   *   // -> "mock@example.com/some-resource-identifier"
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
   * @param {String} jid The jid who's events we listen to.
   * @param {Function} handler Function of one argument: the message packet received.
   * @returns {OX.Connection} The receiver.
   * @example
   *   var ox = OX.Connection.extend({ connectionAdapter: bosh });
   *   ox.registerJIDHandler('pubsub.active-calls.xmpp.onsip.com', function (packet) {
   *     ...
   *   });
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
   *   var ox = OX.Connection.extend({ connectionAdapter: bosh });
   *   ox.unregisterJIDHandler('pubsub.active-calls.xmpp.onsip.com');
   *
   * @param {String} jid The jid who's events we listen to.
   * @returns {OX.Connection} The receiver.
   *
   * @see OX.Connection#unregisterJIDHandler
   * @see OX.ConnectionAdapter#unregisterHandler
   */
  unregisterJIDHandler: function (jid) {
    delete this.jidHandlers[jid];
    return this;
  }
});
