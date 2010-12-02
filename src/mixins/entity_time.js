/**
 * @namespace
 * Entity Time Mixin.
 *
 * @see <a href="http://xmpp.org/extensions/xep-0202.html">XEP 0202: Entity Time</a>
 * @requires A 'connectionAdapter' property which is an {@link OX.ConnectionAdapter} object on receiving object.
 */
OX.Mixin.EntityTime = /** @lends OX.Mixin.EntityTime# */{

  /**
   * Request the time from the XMPP server you're connected to.
   * @param {OX.URI} entityURI The URI to query for the time.
   * @param {Object} [callbacks] Callbacks with 'onSuccess' and 'onError'
   *   @param {Function} [callbacks.onSuccess] The success callback
   *     @param {OX.PacketAdapter} [callbacks.onSuccess.packet] The packet recieved.
   *     @param {Object} [callbacks.onSuccess.time] The parsed time with slots 'tzo' and 'utc'.
   *       @param {String} [callbacks.onSuccess.time.utc] The UTC time according to the responding entity.
   *       @param {String} [callbacks.onSuccess.time.tzo] The entity's numeric time zone offset from UTC.
   *   @param {Function} [callbacks.onError] The error callback
   *     @param {OX.PacketAdapter} [callbacks.onError.packet] The packet recieved.
   * @returns {void}
   */
  getTime: function (entityURI, callbacks) {
    var iq = OX.XML.XMPP.IQ.extend(),
        time = OX.XML.Element.extend({name: 'time',
                                      xmlns: 'urn:xmpp:time'});

    iq.to(entityURI.path);
    iq.type('get');
    iq.addChild(time);

    this.connection.send(iq.toString(), function (packet) {
      if (packet.getType() === 'error' && callbacks.onError) {
        callbacks.onError(packet);
      } else if (callbacks.onSuccess) {
        var node = packet.getNode(),
            elTZO = node.getElementsByTagName('tzo')[0],
            elUTC = node.getElementsByTagName('utc')[0];

        callbacks.onSuccess(packet, {
          tzo: elTZO && (elTZO.textContent || elTZO.text),
          utc: elUTC && (elUTC.textContent || elUTC.text)
        });
      }
    });
  }
};
