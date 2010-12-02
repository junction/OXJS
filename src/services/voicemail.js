/**
 * @namespace
 * <p>Namespace for voicemail related services.</p>
 * <p>The voicemail pubsub service allows subscribed users to
 * receive updates regarding the status of their voicemail account(s),
 * e.g. added, deleted, or moved voicemail messages.</p>
 *
 * @extends OX.Base
 * @extends OX.Mixin.Subscribable
 * @requires A 'connectionAdapter' property inherited from an {@link OX.Connection}.
 * @see <a href="http://wiki.onsip.com/docs/Voicemail_Pubsub">Voicemail PubSub</a>
 */
OX.Service.Voicemail = OX.Base.extend(OX.Mixin.Subscribable, function () {
  function itemType(element) {
    if (!element) {
      return undefined;
    } else if (element.getElementsByTagName('voicemail').length > 0) {
      return 'voicemail';
    } else if (element.getElementsByTagName('labels').length > 0) {
      return 'labels';
    } else {
      return undefined;
    }
  }

  function voicemailItem(element) {
    if (!element) {
      return undefined;
    }

    var rc = {};
    var voicemailNode = element.getElementsByTagName('voicemail');

    if (!voicemailNode || !voicemailNode[0]) {
      return undefined;
    }

    var children = voicemailNode[0].childNodes;
    for (var i = 0, len = children.length; i < len; i++) {
      var node = children[i];

      if (!node.nodeName || !node.firstChild) {
        continue;
      }

      switch (node.nodeName.toLowerCase()) {
      case 'mailbox':
        rc.mailbox = parseInt(node.firstChild.nodeValue, 10);
        break;
      case 'caller-id':
        rc.callerID = node.firstChild.nodeValue;
        break;
      case 'created':
        rc.created = node.firstChild.nodeValue;
        break;
      case 'sipfrom':
        rc.sipfrom = node.firstChild.nodeValue;
        break;
      case 'duration':
        rc.duration = parseInt(node.firstChild.nodeValue, 10);
        break;
      case 'labels':
        var labels = [];
        for (var j = 0, jlen = node.childNodes.length; j < jlen; j++) {
          var elt = node.childNodes[j];
          if (elt.tagName && elt.tagName === 'label') {
            labels.push(elt.firstChild.nodeValue);
          }
        }
        rc.labels = labels;
        break;
      }
    }
    return rc;
  }

  function labelItem(element) {
    if (!element) {
      return undefined;
    }

    var rc = {labels: []};
    var labelsNode = element.getElementsByTagName('labels');

    if (!labelsNode || !labelsNode[0]) {
      return undefined;
    }

    var children = labelsNode[0].childNodes;
    for (var i = 0, len = children.length; i < len; i++) {
      var node = children[i];

      if (node.nodeName && node.nodeName === 'label') {
        rc.labels.push(node.firstChild.nodeValue);
      }
    }
    return rc;
  }

  return /** @lends OX.Service.Voicemail */{
    /**
     * URI for this PubSub service.
     */
    pubSubURI: OX.Settings.URIs.pubSub.voicemail,

    /**
     * @name OX.Service.Voicemail.Item
     * @namespace
     * Voicemail Item.
     * @extends OX.Item
     */
    Item: OX.Item.extend(/** @lends OX.Service.Voicemail.Item# */{
      /** The mailbox number for this voicemail. */
      mailbox:  null,

      /** The caller ID of this voicemail. */
      callerID: null,

      /** The time this voicemail was created. */
      created:  null,

      /** How long, in seconds, this voicemail is. */
      duration: null,

      /** An array of labels for this voicemail. */
      labels:   null,

      /**
       * Cache this Voicemail.
       *
       * @param {Object} [callbacks] Callbacks with 'onSuccess' and 'onError'
       *   @param {Function} [callbacks.onSuccess] The success callback
       *     @param {OX.PacketAdapter} [callbacks.onSuccess.packet] The packet recieved.
       *   @param {Function} [callbacks.onError] The error callback
       *     @param {OX.PacketAdapter} [callbacks.onError.packet] The packet recieved.
       * @returns {void}
       *
       * @see <a href="http://wiki.onsip.com/docs/Voicemail_Component#cache">Voicemail caching</a>
       */
      cacheMessage: function (callbacks) {
        var iq    = OX.XML.XMPP.IQ.extend(),
            cmd   = OX.XML.XMPP.Command.extend(),
            xData = OX.XML.XMPP.XDataForm.extend(),
            uri   = OX.Settings.URIs.command.cacheVoicemail,
            node_parts     = this.uri.queryParam('node').split('/'),
            vm_sip_address = node_parts[2] + '@' + node_parts[1],
            vm_id          = this.uri.queryParam('item');

        callbacks = callbacks || {};

        iq.to(uri.path);
        iq.type('set');
        cmd.node(uri.queryParam('node'));
        xData.type('submit');
        xData.addField('vm-sip-address', vm_sip_address);
        xData.addField('vm-id', vm_id);

        iq.addChild(cmd.addChild(xData));

        this.connection.send(iq.toString(), function (packet) {
          if (!packet) {
            return;
          }
          if (packet.getType() === 'error' && callbacks.onError &&
              callbacks.onError.constructor === Function) {
            callbacks.onError(packet);
          } else if (callbacks.onSuccess && callbacks.onSuccess.constructor === Function) {
            callbacks.onSuccess(packet);
          }
        }, []);
      },

      /**
       * Delete this Voicemail.
       *
       * @param {Object} [callbacks] Callbacks with 'onSuccess' and 'onError'
       *   @param {Function} [callbacks.onSuccess] The success callback
       *     @param {OX.PacketAdapter} [callbacks.onSuccess.packet] The packet recieved.
       *   @param {Function} [callbacks.onError] The error callback
       *     @param {OX.PacketAdapter} [callbacks.onError.packet] The packet recieved.
       * @returns {void}
       *
       * @see <a href="http://wiki.onsip.com/docs/Voicemail_Component#delete">Deleting voicemail</a>
       */
      deleteMessage: function (callbacks) {
        var iq    = OX.XML.XMPP.IQ.extend(),
            cmd   = OX.XML.XMPP.Command.extend(),
            xData = OX.XML.XMPP.XDataForm.extend(),
            uri   = OX.Settings.URIs.command.deleteVoicemail,
            node_parts     = this.uri.queryParam('node').split('/'),
            vm_sip_address = node_parts[2] + '@' + node_parts[1],
            vm_id          = this.uri.queryParam('item');

        callbacks = callbacks || {};

        iq.to(uri.path);
        iq.type('set');
        cmd.node(uri.queryParam('node'));
        xData.type('submit');
        xData.addField('vm-sip-address', vm_sip_address);
        xData.addField('vm-id', vm_id);

        iq.addChild(cmd.addChild(xData));

        this.connection.send(iq.toString(), function (packet) {
          if (!packet) {
            return;
          }
          if (packet.getType() === 'error' && callbacks.onError &&
              callbacks.onError.constructor === Function) {
            callbacks.onError(packet);
          } else if (callbacks.onSuccess && callbacks.onSuccess.constructor === Function) {
            callbacks.onSuccess(packet);
          }
        }, []);
      }

    }),

    /**
     * @name OX.Service.Voicemail.LabelItem
     * @namespace
     * Voicemail Label Item
     *
     * @extends OX.Item
     */
    LabelItem: OX.Item.extend(/** @lends OX.Service.Voicemail.LabelItem#*/{
      /** An array of all voicemail labels. */
      labels: null
    }),

    /** @private
     * Returns an {@link OX.Service.Voicemail.Item} or {@link OX.Service.Voicemail.LabelItem}
     * from an XML Document.
     * This method should be called once for each item to be constructed.
     * If a DOMElement contains more than one item node, only the first
     * item node will be returned as an OX.Service.Voicemail.Item
     *
     * @param {Element|Node} element The DOM Element or Node to parse into a {@link OX.Service.Voicemail.Item} or
     *                               {@link OX.Service.Voicemail.LabelItem}.
     * @returns {OX.Service.Voicemail.Item} The item created from the element passed in.
     */
    itemFromElement: function (element) {
      var rc, item;

      switch (itemType(element)) {
      case 'voicemail':
        item = voicemailItem(element);
        if (item) {
          rc = this.Item.extend(item, {connection: this.connection});
        }
        break;
      case 'labels':
        item = labelItem(element);
        if (item) {
          rc = this.LabelItem.extend(item, {connection: this.connection});
        }
        break;
      }

      return rc;
    }
  };
}());
