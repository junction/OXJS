/**
 * @namespace
 * <p>Namespace for auth related services.</p>
 * <p>In order to allow any JID to perform a command for a SIP address
 * or subscribe to PubSub data regarding a SIP address or SIP domain the
 * JID must authorize itself (or another JID) by providing a SIP user
 * address and a password to the Auth component.</p>
 *
 * @extends OX.Base
 * @requires A connection property inherited from an {@link OX.Connection}.
 * @see <a href="http://wiki.onsip.com/docs/Auth_Component">Auth Component</a>
 */
OX.Service.Auth = OX.Base.extend(OX.Mixin.EntityTime, /** @lends OX.Service.Auth */{

  /**
   * Requests the time from the authentication service.
   * Used to get an authoritative time source so it's known
   * when you have to re-authenticate with the XMPP API.
   *
   * @param {Object} [callbacks] Callbacks with 'onSuccess' and 'onError'
   *   @param {Function} [callbacks.onSuccess] The success callback
   *     @param {OX.PacketAdapter} [callbacks.onSuccess.packet] The packet recieved.
   *     @param {Object} [callbacks.onSuccess.time] The parsed time with slots 'tzo' and 'utc'.
   *   @param {Function} [callbacks.onError] The error callback
   *     @param {OX.PacketAdapter} [callbacks.onError.packet] The packet recieved.
   * @returns {void}
   */
  entityTime: function (cb) {
    return this.getTime(OX.Settings.URIs.entity.auth, cb);
  },

  /**
   * Authorize a JID for a SIP address, authorized via a password. This
   * password is sent in clear text to the XMPP API, so your connection
   * should be encrypted for your own safety.
   *
   * @param {String} address The SIP address for authentication.
   * @param {String} password The web password for the SIP address.
   * @param {String} [jid] The JID to authorize for the SIP address. If unspecified, use the current JID from the underlying connection.
   * @param {Object} [callbacks] An object supplying functions for 'onSuccess', and 'onError'.
   * @returns {void}
   *
   * @example
   *   ox.Auth.authorizePlain('sip@example.com', 'password', 'jid@example.com', {
   *     onSuccess: function () {},
   *     onError:   function (error) {}
   *   });
   */
  authorizePlain: function (address, password, jid, authForAll) {
    var iq    = OX.XML.XMPP.IQ.extend(),
        cmd   = OX.XML.XMPP.Command.extend(),
        xData = OX.XML.XMPP.XDataForm.extend(),
        uri   = OX.Settings.URIs.command.authorizePlain;

    var callbacks = {};
    if (arguments.length > 0 &&
        arguments[arguments.length - 1] &&
        (arguments[arguments.length - 1].onSuccess || arguments[arguments.length - 1].onError)) {
      callbacks = arguments[arguments.length - 1];

      if (authForAll === callbacks) {
        authForAll = null;
      }
      if (jid === callbacks) {
        jid = null;
      }
      if (password === callbacks) {
        password = null;
      }
      if (address === callbacks) {
        address = null;
      }
    }

    iq.to(uri.path);
    iq.type('set');
    cmd.node(uri.queryParam('node'));
    xData.type('submit');
    xData.addField('sip-address', address);
    xData.addField('password', password);
    xData.addField('auth-for-all', authForAll ? 'true' : 'false');
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
