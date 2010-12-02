/**
 * @namespace
 * <p>Namespace for active-calls related services.</p>
 *
 * <p>Active Calls pubsub allows for subscribing to
 * evented data regarding the current calls of a SIP address.
 * Data returned in the events may be used for call control
 * purposes in the Active Calls command component or
 * for other application specific usage.</p>
 *
 * <p>The Active-Calls component is responsible for
 * all third party call control (3PCC) requests for the XMPP API.
 * Each command node of the Active Calls component performs
 * a specific 3PCC function, see below for more information.</p>
 *
 * @extends OX.Base
 * @extends OX.Mixin.Subscribable
 * @requires A 'connectionAdapter' property inherited from an {@link OX.Connection}.
 * @requires Authentication to interact with PubSub via {@link OX.Service.Auth}.
 * @see <a href="http://wiki.onsip.com/docs/Active-Calls_Pubsub">ActiveCalls PubSub</a>
 * @see <a href="http://wiki.onsip.com/docs/Active-Calls_Component">ActiveCalls Component</a>
 */
OX.Service.ActiveCalls = OX.Base.extend(OX.Mixin.Subscribable, /** @lends OX.Service.ActiveCalls */ {

  /**
   * URI for this PubSub service.
   */
  pubSubURI: OX.Settings.URIs.pubSub.activeCalls,

  /**
   * @namespace
   * Active Call Item.
   * @name OX.Service.ActiveCalls.Item
   * @extends OX.Item
   * @extends OX.Mixin.CallDialog
   */
  Item: OX.Item.extend(OX.Mixin.CallDialog,/** @lends OX.Service.ActiveCalls.Item# */{
    /** The current dialog state. */
    dialogState: null,

    /** The call ID of this call. */
    callID: null,

    /** The URI of the call originator. */
    fromURI: null,

    /** The URI of the call terminator. */
    toURI: null,

    /** The Address of Record for the User Agent Server. */
    toAOR: null,

    /** The tag for the originating leg of the call. */
    fromTag: null,

    /** The tag for the terminating leg of the call. */
    toTag: null,

    /** Caller ID information for the caller */
    fromDisplay: null,

    /** Caller ID information for the callee */
    toDisplay: null,

    /** The branch tag for this pre-dialog event. */
    branch: null,

    /** The tag inserted into the call-setup-id field */
    callSetupID: null,

    /**
     * <p>When calls are created, the call's origination will be from
     * Junction Network's Call-Setup Server.</p>
     *
     * <p>This lets you know if the call is from the call-setup
     * server or not</p>
     * @returns {Boolean} Whether the call was from the callSetupID.
     */
    isFromCallSetup: function () {
      return !!this.callSetupID;
    },

    /**
     * @returns {Boolean} Whether the call was created or not.
     */
    isCreated: function () {
      return this.dialogState === 'created';
    },

    /**
     * @returns {Boolean} Whether the call was requested.
     */
    isRequested: function () {
      return this.dialogState === 'requested';
    },

    /**
     * @returns {Boolean} Whether the call was confirmed.
     */
    isConfirmed: function () {
      return this.dialogState === 'confirmed';
    },

    /**
     * The XMPP-API requires one of two commands to be called to end
     * a call based on whether or not the call has been answered (confirmed).
     * This is a convenience funtion to make the correct API call based
     * upon the dialog state of the current this object.
     *
     * @param {Object} [callbacks] An object supplying functions for 'onSuccess' and 'onError'.
     *   @param {Function} [callbacks.onSuccess] The success callback.
     *   @param {Function} [callbacks.onError] The error callback.
     *     @param {OX.PacketAdapter} [callbacks.onError.packet] The packet received.
     * @returns {void}
     */
    hangup: function (callbacks) {
      return this.isConfirmed() ? this.terminate(callbacks) : this.cancel(callbacks);
    }

  }),

  /** @private
   * Returns an {@link OX.Service.ActiveCalls.Item} from an XML Document.
   * This method should be called once for each item to be constructed.
   * If a DOM Element contains more than one item node, only the first
   * item node will be returned as an {@link OX.Service.ActiveCalls.Item}
   *
   * @param {Element|Node} element The DOM Element or Node to parse into a {@link OX.Service.ActiveCalls.Item}
   * @returns {OX.Service.ActiveCalls.Item} item
   */
  itemFromElement: function (element) {
    if (!element) {
      return undefined;
    }

    var activeCallNode = element.getElementsByTagName('active-call'),
        attrs          = {connection: this.connection};

    if (!activeCallNode || !activeCallNode[0]) {
      return undefined;
    }

    var childNodes = activeCallNode[0].childNodes;
    function getFirstNodeValue(node) {
      var child = node.firstChild;
      if (child && child.nodeValue === null && child.firstChild) {
        return arguments.callee(child);
      } else if (child && child.nodeValue) {
        return child.nodeValue;
      }
      return undefined;
    }

    for (var i = 0, len = childNodes.length; i < len; i++) {
      var node = childNodes[i];

      if (!node.nodeName) {
        continue;
      }

      switch (node.nodeName.toLowerCase()) {
      case 'dialog-state':
        attrs.dialogState = node.firstChild.nodeValue;
        break;
      case 'call-id':
        attrs.callID = node.firstChild.nodeValue;
        break;
      case 'to-aor':
        attrs.toAOR = node.firstChild && node.firstChild.nodeValue;
        break;
      case 'from-uri':
        attrs.fromURI = node.firstChild.nodeValue;
        break;
      case 'to-uri':
        attrs.toURI = node.firstChild.nodeValue;
        break;
      case 'from-tag':
        attrs.fromTag = node.firstChild.nodeValue;
        break;
      case 'to-tag':
        attrs.toTag = node.firstChild && node.firstChild.nodeValue;
        break;
      case 'branch':
        attrs.branch = node.firstChild && node.firstChild.nodeValue;
        break;
      case 'call-setup-id':
        attrs.callSetupID = node.firstChild && node.firstChild.nodeValue;
        break;
      case 'from-display':
        attrs.fromDisplay = node.firstChild && node.firstChild.nodeValue;
        break;
      case 'to-display':
        attrs.toDisplay = node.firstChild && node.firstChild.nodeValue;
        break;
      }
    }

    return this.Item.extend(attrs);
  },

  /**
   * <p>Create a new call. Note that an 'onSuccess' does <b>NOT</b> mean that call you requested
   * has started, rather it means the XMPP API has handled your IQ (Info Query) stanza and sent the
   * SIP message to kick off the call.</p>
   *
   * <p>You need to monitor ActiveCalls in PubSub to be notified when a call is actually created.</p>
   *
   * <p>The 'callSetupID' <b>MUST</b> conform to the following regular expression for it to be valid:
   * <pre>/[a-z0-9]{8}/</pre></p>
   *
   * <p>In addition, the 'to' and 'from' parameters should be in the 'sip' schema
   * to make SIP calls (which means calls should be prefixed by 'sip:').</p>
   *
   * @param {String} to the SIP address to terminate the call at
   * @param {String} from the SIP address to originate the call from
   * @param {String} callSetupID the end to end call tracking code to be used for a call setup
   * @param {Object} [callbacks] Callbacks with 'onSuccess' and 'onError'
   *   @param {Function} [callbacks.onSuccess] The success callback
   *     @param {OX.PacketAdapter} [callbacks.onSuccess.packet] The packet recieved.
   *   @param {Function} [callbacks.onError] The error callback
   *     @param {OX.PacketAdapter} [callbacks.onError.packet] The packet recieved.
   * @returns {void}
   * @example
   *   // Assuming the organization is apple.onsip.com that you Authenticated for,
   *   // and the users existed, these should be valid.
   *
   *   // Have Paul call John.
   *   ox.ActiveCalls.create('sip:john@apple.onsip.com', 'sip:paul@apple.onsip.com', 'drrobert');
   *
   *   // Have George call 1-800-801-3381.
   *   ox.ActiveCalls.create('sip:18008013381@apple.onsip.com', 'sip:george@apple.onsip.com', 'longlong');
   */
  create: function (to, from, callSetupID, cb) {
    var uri   = OX.Settings.URIs.command.createCall,
        xData = OX.XML.XMPP.XDataForm.create({type: 'submit'}),
        cmd   = OX.XML.XMPP.Command.create({node: uri.queryParam('node')}, xData),
        iq    = OX.XML.XMPP.IQ.create({to: uri.path, type: 'set'}, cmd);

    xData.addField('to', to);
    xData.addField('from', from);
    xData.addField('call-setup-id', callSetupID);

    cb = cb || {};

    this.connection.send(iq.toString(), function (packet) {
      if (!packet) {
        return;
      }

      if (packet.getType() === 'error' &&
          cb.onError && cb.onError.constructor === Function) {
        cb.onError(packet);
      } else if (cb.onSuccess && cb.onSuccess.constructor === Function) {
        cb.onSuccess(packet);
      }
    }, []);
  }
});
