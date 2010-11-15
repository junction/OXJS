/**
 * Entity Time Mixin
 *
 * @namespace
 *
 * <a href="http://xmpp.org/extensions/xep-0202.html">XEP 0202: Entity Time</a>
 *
 * @requires connection A property which is an {@link OX.ConnectionAdapter} object on receiving object.
 */
OX.Mixin.EntityTime = /** @lends OX.Mixin.EntityTime# */{
  getTime: function (entityURI, callbacks) {
    var iq = OX.XMPP.IQ.extend(),
        time = OX.XML.Element.extend({name: 'time',
                                      xmlns: 'urn:xmpp:time'});

    iq.to(entityURI.path);
    iq.type('get');
    iq.addChild(time);

    this.connection.send(iq.convertToString(), function (packet) {
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
