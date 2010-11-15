/**
 * Namespace for roster related services.
 * @namespace
 * @extends OX.Base
 * @requires connection property inherited from an {@link OX.Connection}.
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
   * @param {String} [jid] The full JID to push roster groups to; if not provided, the JID in the IQ 'from' attribute will be assumed.
   *
   * @example
   * ox.Rosters.pushRosterGroups('jid@example.com', {
   *   onSuccess: function () {},
   *   onError:   function (error) {}
   * });
   */
  pushRosterGroups: function (jid) {
    var iq    = OX.XMPP.IQ.extend(),
        cmd   = OX.XMPP.Command.extend(),
        xData = OX.XMPP.XDataForm.extend(),
        uri   = OX.Settings.URIs.command.pushRosterGroups;

    var callbacks = {};
    if (arguments.length > 0 && arguments[arguments.length - 1]) {
      callbacks = arguments[arguments.length - 1];
    }

    iq.to(uri.path);
    iq.type('set');
    cmd.node(uri.queryParam('node'));
    xData.type('submit');
    if (jid) {
      xData.addField('jid', jid);
    }

    iq.addChild(cmd.addChild(xData));

    this.connection.send(iq.convertToString(), function (packet) {
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
