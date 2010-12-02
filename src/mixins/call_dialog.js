/**
 * @namespace
 * CallDialog mixin.
 *
 * @requires A 'connectionAdapter' property which is an {@link OX.ConnectionAdapter} object on receiving object.
 * @requires A 'callID' property on receiving object.
 * @requires A 'fromTag' property on receiving object.
 * @requires A 'toTag' property on receiving object.
 */
OX.Mixin.CallDialog = /** @lends OX.Mixin.CallDialog# */{
  /**
   * Transfer a call to a sip address.
   *
   * @param {String} targetURI To what SIP URI to transfer the active call.
   * @param {String} endpoint Either 'caller' or 'callee'
   * @param {Object} [callbacks] An object supplying functions for 'onSuccess', and 'onError'.
   *   @param {Function} [callbacks.onSuccess] The success callback.
   *   @param {Function} [callbacks.onError] The error callback.
   *     @param {OX.PacketAdapter} [callbacks.onError.packet] The packet recieved.
   * @returns {void}
   *
   * @see <a href="http://wiki.onsip.com/docs/Active-Calls_Component#transfer">Transferring a call</a>
   * @example
   *   call.transfer('sip:lisa@example.com', 'callee');
   */
  transfer: function (targetURI, endpoint, callbacks) {
    var iq    = OX.XML.XMPP.IQ.extend(),
        cmd   = OX.XML.XMPP.Command.extend(),
        xData = OX.XML.XMPP.XDataForm.extend(),
        uri   = OX.Settings.URIs.command.transferCall;

    callbacks = callbacks || {};

    iq.to(uri.path);
    iq.type('set');
    cmd.node(uri.queryParam('node'));
    xData.type('submit');
    xData.addField('call-id',    this.callID);
    xData.addField('from-tag',   this.fromTag);
    xData.addField('to-tag',     this.toTag);
    xData.addField('target-uri', targetURI);
    xData.addField('endpoint',   endpoint);

    iq.addChild(cmd.addChild(xData));

    this.connection.send(iq.toString(), function (packet) {
      if (!packet) {
        return;
      }

      if (packet.getType() === 'error' && callbacks.onError) {
        callbacks.onError(packet);
      } else if (callbacks.onSuccess) {
        callbacks.onSuccess();
      }
    }, []);
  },

  /**
   * Terminate this call.
   *
   * @param {Object} [callbacks] An object supplying functions for 'onSuccess', and 'onError'.
   *   @param {Function} [callbacks.onSuccess] The success callback.
   *   @param {Function} [callbacks.onError] The error callback.
   *     @param {OX.PacketAdapter} [callbacks.onError.packet] The packet recieved.
   * @returns {void}
   *
   * @see <a href="http://wiki.onsip.com/docs/Active-Calls_Component#terminate">Terminating a call</a>
   * @example
   *  call.terminate();
   */
  terminate: function (callbacks) {
    var iq    = OX.XML.XMPP.IQ.extend(),
        cmd   = OX.XML.XMPP.Command.extend(),
        xData = OX.XML.XMPP.XDataForm.extend(),
        uri   = OX.Settings.URIs.command.terminateCall;

    callbacks = callbacks || {};

    iq.to(uri.path);
    iq.type('set');
    cmd.node(uri.queryParam('node'));
    xData.type('submit');
    xData.addField('call-id',  this.callID);
    xData.addField('from-tag', this.fromTag);
    xData.addField('to-tag',   this.toTag);

    iq.addChild(cmd.addChild(xData));

    this.connection.send(iq.toString(), function (packet) {
      if (!packet) {
        return;
      }

      if (packet.getType() === 'error' && callbacks.onError) {
        callbacks.onError(packet);
      } else if (callbacks.onSuccess) {
        callbacks.onSuccess();
      }
    }, []);
  },

  /**
   * Cancel this call.
   *
   * @param {Object} [callbacks] An object supplying functions for 'onSuccess', and 'onError'.
   *   @param {Function} [callbacks.onSuccess] The success callback.
   *   @param {Function} [callbacks.onError] The error callback.
   *     @param {OX.PacketAdapter} [callbacks.onError.packet] The packet recieved.
   * @returns {void}
   *
   * @see <a href="http://wiki.onsip.com/docs/Active-Calls_Component#cancel">Cancelling a call</a>
   * @example
   *   call.cancel();
   */
  cancel: function (callbacks) {
    var iq    = OX.XML.XMPP.IQ.extend(),
        cmd   = OX.XML.XMPP.Command.extend(),
        xData = OX.XML.XMPP.XDataForm.extend(),
        uri   = OX.Settings.URIs.command.cancelCall;

    callbacks = callbacks || {};

    iq.to(uri.path);
    iq.type('set');
    cmd.node(uri.queryParam('node'));
    xData.type('submit');
    xData.addField('call-id',  this.callID);
    xData.addField('from-tag', this.fromTag);

    iq.addChild(cmd.addChild(xData));

    this.connection.send(iq.toString(), function (packet) {
      if (!packet) {
        return;
      }

      if (packet.getType() === 'error' && callbacks.onError) {
        callbacks.onError(packet);
      } else if (callbacks.onSuccess) {
        callbacks.onSuccess();
      }
    }, []);
  }
};
