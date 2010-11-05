/**
 * Strophe Connection Adapter
 * @class
 * @extends OX.ConnectionAdapter
 */
OX.StropheAdapter = OX.ConnectionAdapter.extend(
  /** @lends OX.StropheAdapter# */{

  /** @private */
  _callbacks: {},
  /** @private */
  _handlers: {},

  _callbackQueue: [],
  MAX_QUEUE_SIZE: 100,

  /** @private */
  init: function () {
    this._callbacks = {};
    this._handlers = {};
    this._callbackQueue = [];
  },

  /**
   * @returns {String} The JID associated with the connection.
   */
  jid: function () {
    return this.strophe.jid;
  },

  /**
   * Subscribe to stanza via top-level XMPP tag name.
   *
   * @param {String} event The top level XMPP tag name to register for.
   * @param {Function} handler The function handler for the event.
   */
  registerHandler: function (event, handler) {
    var that = this;

    var wrapper = function (stanza) {
      var packetAdapter = that.toPacket(stanza),
          newArgs = [packetAdapter];

      for (var i = 1, len = arguments.length; i < len; i++) {
        newArgs.push(arguments[i]);
      }

      try {
        handler.apply(this, newArgs);
      } catch (e) {
        OX.error('Error in OX handler: ' + handler +
                 '; Error: ' + e + '; response stanza: ' + stanza);
      }
      return true;
    };

    this.unregisterHandler(event);
    this._handlers[event] = this.strophe.addHandler(wrapper, null, event,
                                                    null, null, null);
  },

  /**
   * Unsubscribe from corresponding event.
   *
   * @param {String} event The event to unsubscribe from.
   */
  unregisterHandler: function (event) {
    var queue = this._callbackQueue, i, len = queue.length, rest;

    if (this._handlers[event]) {
      this.strophe.deleteHandler(this._handlers[event]);
      delete this._handlers[event];

      // Remove from the callback queue
      for (i = 0; i < len; i++) {
        if (queue[i] === event) {
          rest = queue.slice(i + 1, queue.length);
          queue.length = i;
          queue.push(rest);
          break;
        }
      }
    }
  },

  /**
   * Create a DOM node via XML.
   *
   * @private
   * @param {String} xml The xml string to convert into an object.
   * @returns {Element} The document fragment that represents the xml string.
   */
  createNode: function (xml) {
    var node = null, parser = null;
    if (window.ActiveXObject) {
      parser = new ActiveXObject("Microsoft.XMLDOM");
      parser.async = "false";
      parser.setProperty("SelectionLanguage", "XPath");
      parser.loadXML(xml);
      node = parser.firstChild;
    } else {
      parser = new DOMParser();
      node = parser.parseFromString(xml, 'text/xml');
      node = node.firstChild;
      document.adoptNode(node);
    }
    return node;
  },

  /**
   * Send the xml fragment over the connection.
   *
   * @param {String} xml The xml to send.
   * @param {Function} callback The function to call when done.
   * @param {Array} args A list of arguments to provide to the callback.
   */
  send: function (xml, callback, args) {
    var node = this.createNode(xml),
        that = this;

    if (!this.strophe.connected || this.strophe.disconnecting) {
      OX.log('Prevented "' + xml + '" from being sent because ' +
             'the BOSH connection is being disposed / is disposed.');
      return false;
    }

    if (callback) {
      var wrapper = function (stanza) {
        var packetAdapter = that.toPacket(stanza),
            newArgs = [packetAdapter],
            queue = that._callbackQueue, rest,
            event = node.getAttribute('id'), i, len;
        args = args || [];
        for (i = 0, len = args.length; i < len; i++) {
          newArgs.push(args[i]);
        }

        try {
          callback.apply(this, newArgs);
        } catch (e) {
          OX.error('Error in OX handler: ' + callback +
                   '; Error: ' + e + '; response stanza: ' + stanza);
        }

        // Remove from the callback queue
        for (i = 0, len = queue.length; i < len; i++) {
          if (queue[i].toString() === event) {
            rest = queue.slice(i + 1, queue.length);
            queue.length = i;
            queue.push.apply(queue, rest);
            break;
          }
        }

        delete that._callbacks[event];

        return false;
      };

      var id = node.getAttribute('id');
      if (!id) {
        id = this.strophe.getUniqueId();
        node.setAttribute('id', id);
      }

      this._callbacks[id] = this.strophe.addHandler(wrapper, null, null,
                                                       null, id, null);
      this._callbackQueue.unshift(id);
      if (this._callbackQueue.length > this.MAX_QUEUE_SIZE) {
        OX.warn("You have too many callbacks waiting for a response, so I'm getting rid of the oldest one.\n" +
                "If this isn't desired, override the MAX_QUEUE_SIZE of OX.StropheAdapter.");
        delete this._callbacks[this._callbackQueue.pop()];
      }
    }
    return this.strophe.send(node);
  },

  /**
   * Convert a stanza into an object that implements {@link OX.PacketAdapter}.
   *
   * @private
   * @param {Element} stanza The XMPP stanza to pack.
   *
   * @returns {OX.PacketAdapter} The stanza wrapped as a packet.
   */
  toPacket: function (stanza) {
    var to = stanza.getAttribute('to'),
        from = stanza.getAttribute('from'),
        type = stanza.getAttribute('type');
    return {
      getFrom: function () {
        return from;
      },
      getType: function () {
        return type;
      },
      getTo: function () {
        return to;
      },
      getNode: function () {
        return stanza;
      }
    };
  }
});
