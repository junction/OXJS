/**
 * Mixins namespace.
 * @namespace
 */
OX.Mixins = {};

/**
 * CallDialog mixin.
 *
 * @namespace
 * @requires connection A property which is an OX.ConnectionAdapter object on receiving object.
 * @requires callID property on receiving object.
 * @requires fromTag property on receiving object.
 * @requires toTag property on receiving object.
 */
OX.Mixins.CallDialog = function () {
  function getTransferURI () {
    if (arguments.callee._cached === undefined) {
      arguments.callee._cached = OX.URI.parse(OX.Services.ActiveCalls.commandURIs.transfer);
    }
    return arguments.callee._cached;
  }

  function getHangupURI () {
    if (arguments.callee._cached === undefined) {
      arguments.callee._cached = OX.URI.parse(OX.Services.ActiveCalls.commandURIs.hangup);
    }
    return arguments.callee._cached;
  }

  return /** @lends OX.Mixins.CallDialog# */{
    /**
     * Transfer a call to a sip address.
     *
     * @param {String} to To whom to transfer the active call.
     * @param {Object} [callbacks] An object supplying functions for 'onSuccess', and 'onError'.
     *
     * @example
     * call.transfer('lisa@example.com');
     */
    transfer: function (to, callbacks) {
      var iq    = OX.XMPP.IQ.extend(),
          cmd   = OX.XMPP.Command.extend(),
          xData = OX.XMPP.XDataForm.extend();

      callbacks = callbacks || {};

      iq.to(getTransferURI().path);
      iq.type('set');
      cmd.node('transfer');
      xData.type('submit');
      xData.addField('call-id',    this.callID);
      xData.addField('from-tag',   this.fromTag);
      xData.addField('to-tag',     this.toTag);
      xData.addField('to-address', to);

      iq.addChild(cmd.addChild(xData));

      this.connection.send(iq.toString(), function (packet) {
        if (!packet)
          return;

        if (packet.getType() === 'error' && callbacks.onError) {
          callbacks.onError(packet);
        } else if (callbacks.onSuccess) {
          callbacks.onSuccess();
        }
      }, []);
    },

    /**
     * Hangup this call.
     *
     * @param {Object} [callbacks] An object supplying functions for 'onSuccess', and 'onError'.
     *
     * @example
     * call.hangup();
     */
    hangup: function (callbacks) {
      var iq    = OX.XMPP.IQ.extend(),
          cmd   = OX.XMPP.Command.extend(),
          xData = OX.XMPP.XDataForm.extend();

      callbacks = callbacks || {};

      iq.to(getHangupURI().path);
      iq.type('set');
      cmd.node('hangup');
      xData.type('submit');
      xData.addField('call-id',  this.callID);
      xData.addField('from-tag', this.fromTag);
      xData.addField('to-tag',   this.toTag);

      iq.addChild(cmd.addChild(xData));

      this.connection.send(iq.toString(), function (packet) {
        if (!packet)
          return;

        if (packet.getType() === 'error' && callbacks.onError) {
          callbacks.onError(packet);
        } else if (callbacks.onSuccess) {
          callbacks.onSuccess();
        }
      }, []);
    }
  };
}();

/**
 * CallLabeler mixin.
 *
 * @namespace
 * @requires connection A property which is an OX.ConnectionAdapter object on receiving object.
 * @requires callID property on receiving object.
 */
OX.Mixins.CallLabeler = function () {
  function getLabelURI () {
    if (arguments.callee._cached === undefined) {
      arguments.callee._cached = OX.URI.parse(OX.Services.RecentCalls.commandURIs.label);
    }
    return arguments.callee._cached;
  }

  return /** @lends OX.Mixins.CallLabeler# */{
    /**
     * Label a call with a short string.
     *
     * @param {String} label A short string used to label this call.
     * @param {Object} [callbacks] An object supplying functions for 'onSuccess', and 'onError'.
     *
     * @example
     * call.label('alice');
     */
    label: function (label, callbacks) {
      var iq    = OX.XMPP.IQ.extend(),
          cmd   = OX.XMPP.Command.extend(),
          xData = OX.XMPP.XDataForm.extend();

      callbacks = callbacks || {};

      iq.to(getLabelURI().path);
      iq.type('set');
      cmd.node('label');
      xData.type('submit');
      xData.addField('call-id', this.callID);
      xData.addField('label',   label);

      iq.addChild(cmd.addChild(xData));

      this.connection.send(iq.toString(), function (packet) {
        if (!packet)
          return;

        if (packet.getType() === 'error' && callbacks.onError) {
          callbacks.onError(packet);
        } else if (callbacks.onSuccess) {
          callbacks.onSuccess();
        }
      }, []);
    }
  };
}();

/**
 * Subscribable mixin.
 *
 * @namespace
 * @requires connection A property which is an OX.ConnectionAdapter object on receiving object.
 * @requires pubSubURI The URI of the PubSub service.
 * @requires itemFromPacket A function which takes a packet argument and returns an item.
 */
OX.Mixins.Subscribable = function () {
  function getURI() {
    if (arguments.callee._cached === undefined) {
      arguments.callee._cached = OX.URI.parse(this.pubSubURI);
    }
    return arguments.callee._cached;
  };

  function packetType(element) {
    switch (element.tagName) {
    case 'subscription':
      return element.getAttribute('subscription');
    case 'items':
      if (element.firstChild.tagName === 'retract')
        return 'retract';
      else
        return 'publish';
    default:
      return undefined;
    }
  }

  function convertItems(document) {
    /*
     * TODO: Without XPath we're taking some schema risks
     * here. Really we only want `/iq/pubsub/items/item'
     * nodes. Since we can't do that easily, just grab any `items'
     * elements and pass any immediate descendants named `item' to
     * itemFromElement.
     */
    var rc    = [],
        items = document.getElementsByTagName('items') || [];

    // Grab the first `items' node found.
    items = items[0];
    if (items && items.childNodes) {
      var children = items.childNodes;
      for (var i = 0, len = children.length; i < len; i++) {
        if (children[i].tagName && children[i].tagName === 'item') {
          rc.push(this.itemFromElement(children[i]));
        }
      }
    }

    return rc;
  }

  function fireEvent(type, packet) {
    function subscriptionURI() {
      var doc    = packet.getDoc(),
          from   = doc.firstChild.getAttribute('from'),
          sub    = doc.firstChild.firstChild.firstChild,
          node   = sub.getAttribute('node');

      return OX.URI.fromObject({path:   from, query: ';node=' + node});
    }

    function retractURI() {
      var doc    = packet.getDoc(),
          from   = doc.firstChild.getAttribute('from'),
          items  = doc.firstChild.firstChild.firstChild,
          node   = items.getAttribute('node'),
          itemID = items.firstChild.getAttribute('id');

      return OX.URI.fromObject({path:  from,
                                query: ';node=' + node + ';item=' + itemID});
    }

    switch (type) {
    case 'subscribed':
      if (this._subscriptionHandlers.onSubscribed) {
        var subscribedURI = subscriptionURI();
        this._subscriptionHandlers.onSubscribed(subscribedURI);
      }
      break;
    case 'pending':
      if (this._subscriptionHandlers.onPending) {
        var pendingURI = subscriptionURI();
        this._subscriptionHandlers.onPending(pendingURI);
      }
      break;
    case 'publish':
      if (this._subscriptionHandlers.onPublish) {
        var items = convertItems.call(this, packet.getDoc());
        for (var i = 0, len = items.length; i < len; i++)
          this._subscriptionHandlers.onPublish(items[i]);
      }
      break;
    case 'retract':
      if (this._subscriptionHandlers.onRetract) {
        var retractURI = retractURI();
        this._subscriptionHandlers.onRetract(retractURI);
      }
      break;
    }
  }

  function jidHandler(packet) {
    var event = packet.getDoc().getElementsByTagName('event')[0];
    if (!event)
      return;

    fireEvent.call(this, packetType(event.firstChild), packet);
  }

  function subscriptionHandler(packet, node, callbacks, origNode, redirects) {
    callbacks = callbacks || {};
    redirects = redirects || 0;

    if (!packet)
      return;

    var finalURI = getURI().extend({query: ';node=' + node}),
        reqURI   = getURI().extend({query: ';node=' + (origNode || node)});
    if (packet.getType() === 'error') {
      var error = packet.getDoc().getElementsByTagName('error')[0];
      if (redirects < 5 && error && error.firstChild &&
          (error.firstChild.tagName === 'redirect' ||
           error.firstChild.tagName === 'gone')) {
        var uri     = OX.URI.parse(error.firstChild.textContent),
            path    = uri.path,
            newNode = uri.queryParam('node');
        if (path && newNode) {
          this.subscribe(newNode, callbacks, origNode, redirects + 1);
        }
      } else if (callbacks.onError) {
        callbacks.onError(reqURI, finalURI, packet);
      }
    } else {
      if (callbacks.onSuccess) {
        origNode = origNode || node;
        callbacks.onSuccess(reqURI, finalURI, packet);

        var pubSub = packet.getDoc().getElementsByTagName('pubsub')[0];
        if (pubSub) {
          fireEvent.call(this, packetType(pubSub.firstChild), packet);
        }
      }
    }
  }

  function getItemsHandler(packet, callbacks) {
    callbacks = callbacks || {};

    if (!packet)
      return;

    if (packet.getType() === 'error') {
      if (callbacks.onError) {
        callbacks.onError(packet);
      }
    } else {
      if (callbacks.onSuccess) {
        callbacks.onSuccess(convertItems.call(this, packet.getDoc()));
      }
    }
  }

  return /** @lends OX.Mixins.Subscribable# */{
    /**
     * Subscribe to a nade.
     *
     * @param {String} node The node ID to subscribe to.
     * @param {Object} [callbacks] an object supplying functions for 'onSuccess', and 'onError'.
     *
     * @example
     * service.subscribe('/', {
     *   onSuccess: function (requestedURI, finalURI) {},
     *   onError:   function (requestedURI, finalURI) {}
     * });
     */
    subscribe: function (node, callbacks) {
      var iq        = OX.XMPP.IQ.extend(),
          pubsub    = OX.XML.Element.extend({name:  'pubsub',
                                             xmlns: 'http://jabber.org/protocol/pubsub'}),
          subscribe = OX.XML.Element.extend({name: 'subscribe'});

      iq.to(getURI.call(this).path);
      iq.type('set');
      subscribe.attr('node', node);
      subscribe.attr('jid', this.connection.getJID());
      iq.addChild(pubsub.addChild(subscribe));

      var that = this;
      var cb = function () { subscriptionHandler.apply(that, arguments); };

      // arguments[2] is the original node, if available.
      // arguments[3] is the redirect count, if available.
      this.connection.send(iq.toString(), cb,
                           [node, callbacks,
                            arguments[2] || node, arguments[3]]);
    },

    /**
     * Unsubscribe from a node.
     *
     * @param {String} node The node ID to subscribe to
     * @param {Object} [callbacks] an object supplying functions for 'onSuccess', and 'onError'
     *
     * @example
     * service.unsubscribe('/', {
     *   onSuccess: function (uri) {},
     *   onError:   function (uri) {}
     * });
     */
    unsubscribe: function (node, callbacks) {
      var iq          = OX.XMPP.IQ.extend(),
          pubsub      = OX.XML.Element.extend({name:  'pubsub',
                                               xmlns: 'http://jabber.org/protocol/pubsub'}),
          unsubscribe = OX.XML.Element.extend({name: 'unsubscribe'});

      iq.to(getURI.call(this).path);
      iq.type('set');
      unsubscribe.attr('node', node);
      unsubscribe.attr('jid',  this.connection.getJID());
      iq.addChild(pubsub.addChild(unsubscribe));

      var that = this;
      var cb = function () { subscriptionHandler.apply(that, arguments); };
      this.connection.send(iq.toString(), cb, [node, callbacks]);
    },

    /**
     * Get the items on a PubSub node.
     *
     * @param {String} node The node ID to subscribe to
     * @param {Object} [callbacks] an object supplying functions for 'onSuccess', and 'onError'
     *
     * @example
     * service.getItems('/', {
     *   onSuccess: function (items) {},
     *   onError:   function (errorPacket) {}
     * });
     */
    getItems: function (node, callbacks) {
      var iq     = OX.XMPP.IQ.extend(),
          pubsub = OX.XML.Element.extend({name:  'pubsub',
                                          xmlns: 'http://jabber.org/protocol/pubsub'}),
          items  = OX.XML.Element.extend({name: 'items'});

      iq.to(getURI.call(this).path);
      iq.type('get');
      items.attr('node', node);
      iq.addChild(pubsub.addChild(items));

      var that = this;
      var cb = function () { getItemsHandler.apply(that, arguments); };
      this.connection.send(iq.toString(), cb, [callbacks]);
    },

    /**
     * Registers appropriate handlers with the connection for
     * pubSubJID. This should be called after mixin.
     *
     * service.registerSubscriptionHandlers();
     */
    registerSubscriptionHandlers: function () {
      var uri = getURI.call(this);
      var that = this;
      var handler = function () { jidHandler.apply(that, arguments); };
      this.connection.registerJIDHandler(uri.path, handler);
    },

    /**
     * Registers a handler for an event.
     *
     * Only one handler can be registered for a given event at a time.
     *
     * @param {String} event One of the strings 'onPending', 'onSubscribed', 'onPublish' or 'onRetract'.
     * @param {Function} handler A function which accepts one argument, which is the packet response.
     *
     * @example
     * service.registerHandler('onPublish', function (item) {});
     */
    registerHandler: function (event, handler) {
      this._subscriptionHandlers[event] = handler;
    },

    /**
     * Unregisters an event handler.
     *
     * @param {String} event One of the strings 'onPending', 'onSubscribed', 'onPublish' or 'onRetract'.
     *
     * @example
     * service.unregisterHandler('onPublish', handlerFunction);
     */
    unregisterHandler: function (event) {
    },

    /**
     * Turn a packet into an item for this service. By default, this
     * does nothing. You must override this within the object being
     * extended for useful behavior.
     */
    itemFromPacket: function (packet) {},

    /**
     * Handlers for various subscription related events.
     *
     * @private
     */
    _subscriptionHandlers: {
      /**
       * This handler is called when we get a pending subscription
       * notification.
       *
       * @param {OX.URI.Base} uri The URI of the subscription request, after redirects.
       */
      onPending: function (uri) {},

      /**
       * This handler is called when we get a completed subscription.
       *
       * @param {OX.URI.Base} uri The URI of the subscription request, after redirects.
       */
      onSubscribed: function (uri) {},

      /**
       * This handler is called when we our subscription is removed.
       *
       * @param {OX.URI.Base} uri The node we were unsubscribed from.
       */
      onUnsubscribed: function (uri) {},

      /**
       * This handler is called when an item is published.
       *
       * @param {OX.Item} item The published item.
       */
      onPublish: function (item) {},

      /**
       * This handler is called when an item is retracted.
       *
       * @param {OX.URI.Base} uri The URI of the retracted item.
       */
      onRetract: function (uri) {}
    }
  };
}();
