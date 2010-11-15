/**
 * Namespace for active-calls related services.
 * @namespace
 * @extends OX.Base
 * @extends OX.Mixin.Subscribable
 * @requires connection property inherited from an {@link OX.Connection}.
 */
OX.Service.ActiveCalls = OX.Base.extend(OX.Mixin.Subscribable, /** @lends OX.Service.ActiveCalls */ {
  /**
   * URI for this PubSub service.
   */
  pubSubURI: OX.Settings.URIs.pubSub.activeCalls,

  /**
   * Active Call Item.
   * @name OX.Service.ActiveCalls.Item
   * @namespace
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

    isFromCallSetup: function () {
      return !!this.callSetupID;
    },

    isCreated: function () {
      return this.dialogState === 'created';
    },

    isRequested: function () {
      return this.dialogState === 'requested';
    },

    isConfirmed: function () {
      return this.dialogState === 'confirmed';
    },

    /**
     * The XMPP-API requires one of two commands to be called to end
     * a call based on whether or not the call has been answered (confirmed).
     * This is a convenience funtion to make the correct API call based
     * upon the dialog state of the current this object.
     */
    hangup: function () {
      return this.isConfirmed() ? this.terminate() : this.cancel();
    }

  }),

  /**
   * Returns an OX.Service.ActiveCalls.Item from an XML Document.
   * This method should be called once for each item to be constructed.
   * If a DOMElement contains more than one item node, only the first
   * item node will be returned as an OX.Service.ActiveCalls.Item
   *
   * @param {DOMElement} element
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
   * Create a new call.
   *
   * @function
   * @param {String} to the SIP address to terminate the call at
   * @param {String} from the SIP address to originate the call from
   * @param {String} callSetupID the end to end call tracking code to be used for a call setup
   * @param {Object} [cb] An object supplying callback functions for 'onSuccess', and 'onError'.
   */
  create: function (to, from, callSetupID, cb) {
    var uri   = OX.Settings.URIs.command.createCall,
        xData = OX.XMPP.XDataForm.create({type: 'submit'}),
        cmd   = OX.XMPP.Command.create({node: uri.queryParam('node')}, xData),
        iq    = OX.XMPP.IQ.create({to: uri.path, type: 'set'}, cmd);

    xData.addField('to', to);
    xData.addField('from', from);
    xData.addField('call-setup-id', callSetupID);

    cb = cb || {};

    this.connection.send(iq.convertToString(), function (packet) {
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
