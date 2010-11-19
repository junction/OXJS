/**
 * @namespace
 * <p>Namespace for roster related services.</p>
 * <p>This service provides a way to request a Roster Item Exchange
 * that advises an XMPP Client what to do with the user's Roster
 * (adding, modifying, and deleting entities).</p>
 * @extends OX.Base
 * @requires connection property inherited from an {@link OX.Connection}.
 * @see <a href="http://wiki.onsip.com/docs/Rosters_Component">Rosters Component</a>
 * @see <a href="http://xmpp.org/extensions/xep-0144.html">XEP-0144: Roster Item Exchange</a>
 */
OX.Service.Rosters = OX.Base.extend(OX.Mixin.Subscribable, /** @lends OX.Service.Rosters */{
  /**
   * Push a roster group from the Junction Networks XMPP API Rosters Component.
   * The first time this is called, a user will receive a series of roster add requests for
   * every user in his organization. The next time he requests roster information he will only
   * receive deltas; that is, add requests of any new users since his last request,
   * modify requests for any user's who have changed contact information, and
   * delete requests for any users who may have been deleted.
   *
   * @param {Object} [callbacks] Callbacks with 'onSuccess' and 'onError'
   *   @param {Function} [callbacks.onSuccess] The success callback
   *     @param {OX.PacketAdapter} [callbacks.onSuccess.packet] The packet recieved.
   *   @param {Function} [callbacks.onError] The error callback
   *     @param {OX.PacketAdapter} [callbacks.onError.packet] The packet recieved.
   * @param {Object} [options]
   *   @param {String} options.jid The full JID to push roster groups to; if not provided, the JID in the IQ 'from' attribute will be assumed.
   * @returns {void}
   *
   * @example
   * ox.Rosters.pushRosterGroups({
   *   onSuccess: function () {},
   *   onError:   function (error) {}
   * }, { jid: 'jid@example.com' });
   */
  pushRosterGroups: function (callbacks, options) {
    var iq    = OX.XML.XMPP.IQ.extend(),
        cmd   = OX.XML.XMPP.Command.extend(),
        xData = OX.XML.XMPP.XDataForm.extend(),
        uri   = OX.Settings.URIs.command.pushRosterGroups,
        jid;

    callbacks = callbacks || {};
    jid = options && options.jid;

    iq.to(uri.path);
    iq.type('set');
    cmd.node(uri.queryParam('node'));
    xData.type('submit');
    if (jid) {
      xData.addField('jid', jid);
    }

    iq.addChild(cmd.addChild(xData));

    this.connection.send(iq.toString(), function (packet) {
      if (!packet) {
        return;
      }

      if (packet.getType() === 'error' && callbacks.onError) {
        callbacks.onError(packet);
      } else if (callbacks.onSuccess) {
        callbacks.onSuccess(packet);
      }
    }, []);
  }
});
