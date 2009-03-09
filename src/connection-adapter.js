/**
 * OX Connection Adapter abstract object.
 *
 * An instance of this object MUST be supplied to the OX.Connection
 * instance. This object is to be defined by consumers of the API as
 * an adapter to the XMPP connection library that is being used. See
 * the example for using the OX.ConnectionAdapter with the JSJaC XMPP
 * library.
 *
 * @example
 * var conn = new JSJaCConnection();
 * var adapter = OX.ConnectionAdapter.extend({
 *   jid: conn.jid,
 *
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
 * @class
 * @extends OX.Base
 */
OX.ConnectionAdapter = OX.Base.extend(/** @lends OX.ConnectionAdapter# */{
  /** The JID of this connection. */
  jid: null,

  /**
   * Send an XML string to the underlying connection.
   *
   * @param {String} xml The XML String to send.
   * @param {Function} callback Called when a response to this packet is received with the first argument being the received packet.
   * @param {Array} args An array of arguments to be passed to callback after the packet.
   *
   * @see OX.Connection#send
   */
  send: function (xml, callback, args) {},

  /**
   * Registers an event handler.
   *
   * @param {String} event One of the strings 'onPublish' or 'onRetract'.
   * @param {Function} handler A function which accepts one argument, which is the packet response.
   *
   * @see OX.Connection#registerJIDHandler
   */
  registerHandler: function (event, handler) {},

  /**
   * Unregisters an event handler.
   *
   * @param {String} event One of the strings 'onPublish' or 'onRetract'.
   * @param {Function} handler A handler already registered for this event.
   *
   * @see OX.Connection#unregisterJIDHandler
   */
  unregisterHandler: function (event, handler) {}
});
