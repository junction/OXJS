/**
 * OX Connection Adapter abstract object.
 *
 * @example
 * var conn = new JSJaCConnection();
 * var adapter = OX.ConnectionAdapter.extend({
 *   jid = 'jill@example.com',
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
  /**
   * The JID of this connection.
   */
  jid: null,

  /**
   * Sends +xml+ to +this.connection+.
   *
   * @param {String} xml The XML String to send.
   * @param {Function} callback Called when a response to this packet is received with the first argument being the received packet.
   * @param {Array} args An array of arguments to be passed to callback after the packet.
   *
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
