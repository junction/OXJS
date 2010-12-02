/**
 * @class
 * Provides a Connection Adapter for the BOSH library
 * <a href="http://code.stanziq.com/strophe">Strophe</a>.
 * The adapter tries to deal with possible memory leaks due to unanswered
 * IQs, having a max queue size of handlers. You should be able to plug-and-play
 * with this adapter and Strophe like the following example:
 *
 * @example
 *   var bosh = new Strophe.Connection('/http-bind/');
 *   var ox = OX.Connection.extend({
 *     connectionAdapter: OX.StropheAdapter.extend({
 *       connection: bosh
 *     })
 *   });
 * @extends OX.ConnectionAdapter
 * @requires A slot named "connection" with an instance of Strophe.Connection provided.
 */
OX.StropheAdapter = OX.ConnectionAdapter.extend(
  /** @lends OX.StropheAdapter# */{

  /** @private */
  _callbacks: {},
  /** @private */
  _handlers: {},
  /** @private */
  _callbackQueue: [],

  /**
   * <p>The maximum allowable size for the callback queue.
   * When it reaches the maximum size, it will warn you about it,
   * and begin removing stale handlers, assuming that they will never be called.
   * This exists as a catch for memory leaks. Change this value to meet your needs.</p>
   *
   * <p>You <i>will</i> be warned when this quota is reached.
   * Make sure that you aren't throwing away any live messages
   * if you want to keep the MAX_QUEUE_SIZE where it is.</p>
   */
  MAX_QUEUE_SIZE: 100,

  /** @private */
  init: function ($super) {
    this._callbacks = {};
    this._handlers = {};
    this._callbackQueue = [];
    $super();
  }.around(),

  /**
   * The connection's JID.
   * @returns {String} The JID associated with the connection.
   */
  jid: function () {
    return this.connection.jid;
  },

  /**
   * Subscribe to stanza via top-level XMPP tag name.
   *
   * @param {String} event The top level XMPP tag name to register for.
   * @param {Function} handler The function handler for the event.
   * @returns {void}
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
    this._handlers[event] = this.connection.addHandler(wrapper, null, event,
                                                       null, null, null);
  },

  /**
   * Unsubscribe from corresponding event.
   *
   * @param {String} event The event to unsubscribe from.
   * @returns {void}
   */
  unregisterHandler: function (event) {
    var queue = this._callbackQueue, i, len = queue.length, rest;

    if (this._handlers[event]) {
      this.connection.deleteHandler(this._handlers[event]);
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
   * @returns {void}
   */
  send: function (xml, callback, args) {
    var node = this.createNode(xml),
        that = this;

    if (!this.connection.connected || this.connection.disconnecting) {
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
        id = this.connection.getUniqueId();
        node.setAttribute('id', id);
      }

      this._callbacks[id] = this.connection.addHandler(wrapper, null, null,
                                                       null, id, null);
      this._callbackQueue.unshift(id);
      if (this._callbackQueue.length > this.MAX_QUEUE_SIZE) {
        OX.warn("You have too many callbacks waiting for a response, so I'm getting rid of the oldest one.\n" +
                "If this isn't desired, override the MAX_QUEUE_SIZE of OX.StropheAdapter.");
        delete this._callbacks[this._callbackQueue.pop()];
      }
    }
    return this.connection.send(node);
  },

  /**
   * @private
   * Convert a stanza into an object that implements {@link OX.PacketAdapter}.
   *
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
