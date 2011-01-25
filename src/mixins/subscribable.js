/**
 * @namespace
 * Subscribable mixin.
 * Something's subscribable if it communicates with a JID that supports
 * <a href="http://xmpp.org/extensions/xep-0060.html">XEP-0060: Publish-Subscribe</a>.
 *
 * @requires A 'connectionAdapter' property which is an {@link OX.ConnectionAdapter} object on receiving object.
 * @requires A 'pubSub' property that's the URI of the PubSub service.
 * @requires An implementation of 'itemFromElement' which takes an Node or Element and returns an item.
 * @see <a href="http://xmpp.org/extensions/xep-0060.html">XEP-0060: Publish-Subscribe</a>
 */
OX.Mixin.Subscribable = (function () {
  /**#nocode+*/
  var MAX_REDIRECTS = 5, ELEMENT_NODE = 1,
    cbDefault = {
      onSuccess: function () {}.inferior(),
      onError: function () {}.inferior()
    }, doSubscribe, doGetSubscriptions, doConfigureNodeSubscription; // fix circular ref for jslint

  function getFirstElementChild(el) {
    var nodeType = ELEMENT_NODE;
    for (var i = 0, l = el.childNodes.length; i < l; i++) {
      if (el.childNodes[i].nodeType === nodeType) {
        return el.childNodes[i];
      }
    }
    return null;
  }

  function packetType(element) {
    if (!element) {
      return null;
    }

    switch (element.tagName) {
    case 'subscription':
      return element.getAttribute('subscription');
    case 'items':
      if (getFirstElementChild(element).tagName === 'retract') {
        return 'retract';
      }
      return 'publish';
    default:
      return null;
    }
  }

  function convertItems(document) {
    function itemURI(itemID, node) {
      var from  = document.getAttribute('from'),
          items = getFirstElementChild(getFirstElementChild(document));

      return OX.URI.fromObject({path: from,
                                query: ';node=' + node + ';item=' + itemID});
    }
    function getPublishTime(element) {
      var firstChild  = getFirstElementChild(element),
          publishTime = firstChild && firstChild.getAttribute('publish-time');

      return publishTime;
    }

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
    for (var i = 0, len = items.length; i < len; i++) {
      if (items[i] && items[i].childNodes) {
        var children = items[i].childNodes,
            node     = items[i].getAttribute('node') || '/',
            item;

        for (var ii = 0, ilen = children.length; ii < ilen; ii++) {
          if (children[ii].tagName && children[ii].tagName === 'item') {
            item = this.itemFromElement(children[ii]);

            item.publishTime = getPublishTime(children[ii]);
            item.uri = itemURI(children[ii].getAttribute('id'),
                               node);
            rc.push(item);
          }
        }
      }
    }

    return rc;
  }

  function redirectURIFromPacket(packet) {
    var e = packet && packet.getNode().getElementsByTagName('error')[0],
        fChild = e && getFirstElementChild(e),
        tName = fChild && fChild.tagName,
        uri = fChild && fChild.firstChild && fChild.firstChild.nodeValue;

    return packet && packet.getType() === 'error' &&
           (tName === 'redirect' || tName === 'gone') &&
           uri && OX.URI.parse(uri) || null;
  }

  function pubSubPacketHandler(actions, packet, node, options, that) {
    if (!packet) {
      return;
    }
    that = that || this;
    var optDefaults = {
      redirectCount: 0,
      origURI: node ? that.pubSubURI.extend({query: ';node=' + node}): that.pubSubURI // this will only be set the first time
    }, redirectURI = redirectURIFromPacket(packet);

    options = OX.Base.mixin.call(optDefaults, options, {
      finalURI: node ? that.pubSubURI.extend({query: ';node=' + node}): that.pubSubURI // this will be set every time
    });

    if (packet.getType() === 'result') {
      actions.result.call(that, packet, node, options);
    } else if (options.redirectCount < MAX_REDIRECTS &&
               redirectURI && redirectURI.path &&
               redirectURI.queryParam('node')) {

      options.redirectCount += 1;
      actions.redirect.call(that, packet, redirectURI.queryParam('node'), options);
    } else {
      actions.error.call(that, packet, node, options);
    }
  }

  function fireEvent(type, packet) {
    function subscriptionURI() {
      var elt    = packet.getNode(),
          from   = elt.getAttribute('from'),
          sub    = getFirstElementChild(getFirstElementChild(elt)),
          node   = sub.getAttribute('node') || '/';

      return OX.URI.fromObject({path:   from, query: ';node=' + node});
    }

    function retractURI() {
      var elt    = packet.getNode(),
          from   = elt.getAttribute('from'),
          items  = elt.getElementsByTagName('items')[0],
          node   = items.getAttribute('node') || '/',
          itemID = getFirstElementChild(items).getAttribute('id');

      return OX.URI.fromObject({path:  from,
                                query: ';node=' + node + ';item=' + itemID});
    }

    switch (type) {
    case 'subscribed':
      if (this._subscriptionHandlers.onSubscribed) {
        var subscribedURI = subscriptionURI();
        this._subscriptionHandlers.onSubscribed(subscribedURI, packet);
      }
      break;
    case 'pending':
      if (this._subscriptionHandlers.onPending) {
        var pendingURI = subscriptionURI();
        this._subscriptionHandlers.onPending(pendingURI, packet);
      }
      break;
    case 'none':
      if (this._subscriptionHandlers.onUnsubscribed) {
        var unsubscribedURI = subscriptionURI();
        this._subscriptionHandlers.onUnsubscribed(unsubscribedURI, packet);
      }
      break;
    case 'publish':
      if (this._subscriptionHandlers.onPublish) {
        var items = convertItems.call(this, packet.getNode());
        for (var i = 0, len = items.length; i < len; i++) {
          this._subscriptionHandlers.onPublish(items[i], packet);
        }
      }
      break;
    case 'retract':
      if (this._subscriptionHandlers.onRetract) {
        this._subscriptionHandlers.onRetract(retractURI(), packet);
      }
      break;
    }
  }

  function jidHandler(packet) {
    var event = packet.getNode().getElementsByTagName('event')[0];
    if (!event) {
      return;
    }

    fireEvent.call(this, packetType(getFirstElementChild(event)), packet);
  }

  function getSubscriptionsHandler(packet, node, callbacks, options) {
    callbacks = OX.Base.mixin.call(callbacks, cbDefault);

    pubSubPacketHandler({
      result: function (packet, node, options) {
        var subscriptions = [],
            subElements = packet.getNode().getElementsByTagName('subscription');
        for (var i = 0; i < subElements.length; i++) {
          if (options.strict && this.connection.getJID() !== subElements[i].getAttribute('jid')) {
            continue;
          }

          subscriptions.push({
            node: subElements[i].getAttribute('node'),
            jid: subElements[i].getAttribute('jid'),
            subscription: subElements[i].getAttribute('subscription'),
            subid: subElements[i].getAttribute('subid')
          });
        }
        callbacks.onSuccess(options.origURI, options.finalURI, subscriptions, packet);
      },
      redirect: function (packet, node, options) {
        doGetSubscriptions.call(this, node, callbacks, options);
      },
      error: function (packet, node, options) {
        callbacks.onError(options.origURI, options.finalURI, packet);
      }
    }, packet, node, options, this);

  }

  function configureNodeSubscriptionHandler(packet, subscription, subOptions, callbacks, options) {
    callbacks = OX.Base.mixin.call(callbacks, cbDefault);

    pubSubPacketHandler({
      result: function (packet, node, options) {
        callbacks.onSuccess(options.origURI, options.finalURI, packet);
      },
      redirect: function (packet, node, options) {
        subOptions.node = node;
        doConfigureNodeSubscription.call(this, subscription, subOptions, callbacks, options);
      },
      error: function (packet, node, options) {
        callbacks.onError(packet);
      }
    }, packet, subscription.node, options, this);
  }

  function subscriptionHandler(packet, node, subOptions, callbacks, options) {
    callbacks = OX.Base.mixin.call(callbacks, cbDefault);

    pubSubPacketHandler({
      result: function (packet, node, options) {
        callbacks.onSuccess(options.origURI, options.finalURI, packet);
        var pubSub = packet.getNode().getElementsByTagName('pubsub')[0] || {},
            subscription = getFirstElementChild(pubSub);

        fireEvent.call(this, packetType(subscription), packet);
      },
      redirect: function (packet, node, options) {
        doSubscribe.call(this, node, subOptions, callbacks, options);
      },
      error: function (packet, node, options) {
        callbacks.onError(options.origURI, options.finalURI, packet);
      }
    }, packet, node, options, this);
  }

  function unsubscriptionHandler(packet, node, callbacks) {
    var uri = this.pubSubURI.extend({query: ';node=' + node});
    callbacks = callbacks || {};

    if (!packet) {
      return;
    }

    if (packet.getType() === 'error') {
      if (callbacks.onError) {
        callbacks.onError(uri, packet.getNode());
      }
    } else {
      if (callbacks.onSuccess) {
        callbacks.onSuccess(uri, packet.getNode());
      }
    }
  }

  function getItemsHandler(packet, callbacks) {
    callbacks = callbacks || {};

    if (!packet) {
      return;
    }

    if (packet.getType() === 'error') {
      if (callbacks.onError) {
        callbacks.onError(packet);
      }
    } else {
      if (callbacks.onSuccess) {
        callbacks.onSuccess(convertItems.call(this, packet.getNode()));
      }
    }
  }

  function zeroPad(spaces, value) {
    var rc = (value || '').toString();
    for (var i = spaces - rc.length; i > 0; i--) {
      rc = '0' + rc;
    }
    return rc;
  }

  var optionTransforms = {
    expire: function (direction, value) {
      switch (direction) {
      case 'fromString':
        return 'oops';
      case 'toString':
        var d  = zeroPad(2, value.getUTCDate()),
            m  = zeroPad(2, value.getUTCMonth() + 1),
            y  = zeroPad(4, value.getUTCFullYear()),
            hh = zeroPad(2, value.getUTCHours()),
            mm = zeroPad(2, value.getUTCMinutes()),
            ss = zeroPad(2, value.getUTCSeconds()),
            ms = zeroPad(4, value.getUTCMilliseconds());
        return y + '-' + m + '-' + d + 'T' + hh + ':' + mm + ':' + ss + '.' + ms + '000Z';
      default:
        return undefined;
      }
    }
  };

  function objectToSubscriptionOptionsForm(options) {
    var xData = OX.XML.XMPP.XDataForm.create({type: 'submit'}),
        opts  = OX.XML.Element.extend({name: 'options'}).create({}, xData);

    xData.addField('FORM_TYPE', 'http://jabber.org/protocol/pubsub#subscribe_options');

    for (var o in options) {
      if (options.hasOwnProperty(o)) {
        var trVal = options[o];
        if (optionTransforms[o]) {
          trVal = optionTransforms[o]('toString', trVal);
        }
        xData.addField('pubsub#' + o, trVal);
      }
    }

    return opts;
  }

  doConfigureNodeSubscription = function (subscription, subOptions, callbacks, options) {
    var iq = OX.XML.XMPP.IQ.extend(),
        pubsub = OX.XML.XMPP.PubSub.extend();

    iq.to(this.pubSubURI.path);
    iq.type('set');
    iq.addChild(pubsub);

    var opts = objectToSubscriptionOptionsForm.call(this, subOptions);
    opts.attr('node', subscription.node);
    opts.attr('jid', subscription.jid);
    opts.attr('subid', subscription.subid);

    pubsub.addChild(opts);

    var that = this;
    var wrappedCb = function () {
      configureNodeSubscriptionHandler.apply(that, arguments);
    };

    this.connection.send(iq.toString(), wrappedCb, [subscription, subOptions, callbacks, options]);
  };

  doSubscribe = function (node, subOptions, callbacks, options) {
    var iq        = OX.XML.XMPP.IQ.extend(),
        pubsub    = OX.XML.XMPP.PubSub.extend(),
        subscribe = OX.XML.Element.extend({name: 'subscribe'});

    iq.to(this.pubSubURI.path);
    iq.type('set');
    subscribe.attr('node', node);
    subscribe.attr('jid', this.connection.getJID());
    pubsub.addChild(subscribe);

    if (subOptions) {
      var opts = objectToSubscriptionOptionsForm.call(this, subOptions);
      pubsub.addChild(opts);
    }
    iq.addChild(pubsub);

    var that = this;
    var cb = function () {
      subscriptionHandler.apply(that, arguments);
    };

    this.connection.send(iq.toString(), cb, [node, subOptions, callbacks, options]);
  };

  doGetSubscriptions = function (node, callbacks, options) {
    var iq = OX.XML.XMPP.IQ.extend(),
        pub = OX.XML.XMPP.PubSub.extend(),
        sub = OX.XML.Element.extend({name: 'subscriptions'});

    iq.to(this.pubSubURI.path);
    iq.type('get');

    if (node) {
      sub.attr('node', node);
    }

    pub.addChild(sub);
    iq.addChild(pub);

    var that = this;
    var wrappedCb = function () {
      getSubscriptionsHandler.apply(that, arguments);
    };

    this.connection.send(iq.toString(), wrappedCb, [node, callbacks, options]);
  };
  /**#nocode-*/

  /**
   * @name OX.Subscription
   * @class Subscription object signature.
   * @see <a href="http://xmpp.org/extensions/xep-0060.html#schemas-pubsub">XMPP PubSub schema</a>
   */

  /**
   * @name OX.Subscription#node
   * @field
   * @description
   * The optional node that the subscription is on.
   * @type String
   */

  /**
   * @name OX.Subscription#jid
   * @field
   * @description
   * The required JID that the subscription is on.
   * @type String
   */

  /**
   * @name OX.Subscription#subscription
   * @field
   * @description
   * The optional subscription state of the subscription.
   * One of 'none', 'pending', 'subscribed', or 'unconfigured'.
   * @type String
   */

  /**
   * @name OX.Subscription#subid
   * @field
   * @description
   * The optional subscription id.
   * @type String
   */

  return /** @lends OX.Mixin.Subscribable# */{

    /**
     * @private
     * Registers appropriate handlers with the connection for pubSubJID.
     */
    init: function ($super) {
      var tpl = OX.Mixin.Subscribable._subscriptionHandlers;
      this._subscriptionHandlers = OX.Base.extend(tpl);

      if (this.connection && this.pubSubURI) {
        var uri = this.pubSubURI;
        var that = this;
        var handler = function () {
          jidHandler.apply(that, arguments);
        };
        this.connection.registerJIDHandler(uri.path, handler, this.connection);
      }

      $super();
    }.around(),

    /**
     * Get subscriptions on a node.
     *
     * Passing an initial <tt>node</tt> parameter retrieves subscriptions on the requested
     * node.  Otherwise a single parameter of <tt>callbacks</tt> requests all subscriptions
     * at all nodes of the pubsub service.
     *
     * @see <a href="http://xmpp.org/extensions/xep-0060.html#entity-subscriptions">XEP: 0060 - Entity Subscriptions</a>
     *
     * @param {Object} callbacks an object supplying functions for 'onSuccess' and 'onError'
     *   @param {Function} callbacks.onSuccess The success callback.
     *     @param {OX.URI} callbacks.onSuccess.requestedURI The URI you requested.
     *     @param {OX.URI} callbacks.onSuccess.finalURI The redirected URI that your requested URI maps to.
     *     @param {OX.Subscription[]} callbacks.onSuccess.subscriptions The subscriptions associated with the finalURI.
     *     @param {OX.PacketAdapter} callbacks.onSuccess.packet The packet recieved.
     *   @param {Function} callbacks.onError The error callback.
     *     @param {OX.URI} callbacks.onError.requestedURI The URI you requested.
     *     @param {OX.URI} callbacks.onError.finalURI The redirected URI that your requested URI maps to.
     *     @param {OX.PacketAdapter} callbacks.onError.packet The packet recieved.
     * @param {Object} [options]
     *   @param {String} options.node The node name to request subscriptions on. Omitting the node name implies all nodes
     *   @param {Boolean} options.strict Only apply callbacks to subscriptions that match the exact JID as the current connection.
     * @returns {void}
     * This will NOT match a bare JID to a full JID.
     *
     * @example
     *   service.getSubscriptions({
     *     onSuccess: function (requestedURI, finalURI, subscriptions, packet) {},
     *     onError: function (requestedURI, finalURI, packet)
     *   }, {node: '/'});
     *
     * @example
     *   service.getSubscriptions({
     *     onSuccess: function (requestedURI, finalURI, subscriptions, packet) {},
     *     onError: function (requestedURI, finalURI, packet)
     *   });
     */
    getSubscriptions: function (callbacks, options) {
      options = options || {};
      doGetSubscriptions.call(this, options.node, callbacks, options);
    },

    /**
     * Configure a subscription with the subscription options.
     *
     * @param {OX.Subscription} subscription The subscription to configure.
     * @param {Object} [subOptions] Subscription options
     * @param {Object} [callbacks] an object supplying functions for 'onSuccess', and 'onError'.
     *   @param {Function} [callbacks.onSuccess] The success callback.
     *     @param {OX.URI} [callbacks.onSuccess.requestedURI] The URI you requested.
     *     @param {OX.URI} [callbacks.onSuccess.finalURI] The redirected URI that your requested URI maps to.
     *     @param {OX.PacketAdapter} [callbacks.onSuccess.packet] The packet of the returned subscription.
     *   @param {Function} [callbacks.onError] The error callback.
     *     @param {OX.URI} [callbacks.onError.requestedURI] The URI you requested.
     *     @param {OX.URI} [callbacks.onError.finalURI] The redirected URI that your requested URI maps to.
     *     @param {OX.PacketAdapter} [callbacks.onSuccess.packet] The packet that contains the error.
     * @returns {void}
     *
     * @see <a href="http://xmpp.org/extensions/xep-0060.html#subscriber-configure-submit">XEP-0060: Subscriber Configuration</a>
     */
    configureNodeSubscription: function (subscription, subOptions, callbacks) {
      doConfigureNodeSubscription.apply(this, arguments);
    },

    /**
     * Subscribe to a node.
     *
     * @param {String} node The node ID to subscribe to.
     * @param {Object} [subOptions] Subscription options
     * @param {Object} [callbacks] an object supplying functions for 'onSuccess', and 'onError'.
     *   @param {Function} [callbacks.onSuccess] The success callback.
     *     @param {OX.URI} [callbacks.onSuccess.requestedURI] The URI you requested.
     *     @param {OX.URI} [callbacks.onSuccess.finalURI] The redirected URI that your requested URI maps to.
     *     @param {OX.PacketAdapter} [callbacks.onSuccess.packet] The packet of the returned subscription.
     *   @param {Function} [callbacks.onError] The error callback.
     *     @param {OX.URI} [callbacks.onError.requestedURI] The URI you requested.
     *     @param {OX.URI} [callbacks.onError.finalURI] The redirected URI that your requested URI maps to.
     *     @param {OX.PacketAdapter} [callbacks.onSuccess.packet] The packet that contains the error.
     * @param {Object} [options] Optional arguments.
     *   @param {Boolean} [options.reuseSubscriptions] Tells subscribe to lookup subscriptions on the requested node, then reuse any if they exist. If none exist, it will create a new subscription.
     * @returns {void}
     *
     * @example
     *   var subOptions = {expire: new Date()};
     *   service.subscribe('/', subOptions, {
     *     onSuccess: function (requestedURI, finalURI) {},
     *     onError:   function (requestedURI, finalURI) {}
     *   });
     */
    subscribe: function (node, subOptions, callbacks, options) {
      options = options || {};
      callbacks = callbacks || {};

      var that = this;
      if (options.reuseSubscriptions) {
        this.getSubscriptions({
          onSuccess: function (requestedURI, finalURI, subs, packet) {
            var resubscribed = false,
                finalNode = finalURI.queryParam('node');

            for (var i = 0, len = subs.length; i < len; i++) {
              if (subs[i].subscription === 'subscribed') {
                subs[i].node = finalURI.queryParam('node'); // Node is not set when specifying a node.
                that.configureNodeSubscription(subs[i], subOptions, callbacks, {
                  origURI: requestedURI
                });
                resubscribed = true;
                break;
              }
            }

            if (!resubscribed) {
              options.reuseSubscriptions = false;
              that.subscribe(node, subOptions, callbacks, options);
            }
          },
          onError: callbacks.onError
        }, { strict: true, node: node });
      } else {
        doSubscribe.call(this, node, subOptions, callbacks, options);
      }
    },

    /**
     * Unsubscribe from a node.
     *
     * @param {String} node The node ID to subscribe to
     * @param {Object} [callbacks] an object supplying functions for 'onSuccess', and 'onError'.
     *   @param {Function} [callbacks.onSuccess] The success callback.
     *     @param {OX.URI} [callbacks.onSuccess.uri] The URI you unsubscribed from.
     *   @param {Function} [callbacks.onError] The error callback.
     *     @param {OX.URI} [callbacks.onSuccess.uri] The URI you failed to unsubscribe from.
     * @returns {void}
     *
     * @example
     *   service.unsubscribe('/', {
     *     onSuccess: function (uri) {},
     *     onError:   function (uri) {}
     *   });
     */
    unsubscribe: function (node, callbacks) {
      var iq          = OX.XML.XMPP.IQ.extend(),
          pubsub      = OX.XML.Element.extend({name:  'pubsub',
                                               xmlns: 'http://jabber.org/protocol/pubsub'}),
          unsubscribe = OX.XML.Element.extend({name: 'unsubscribe'});

      iq.to(this.pubSubURI.path);
      iq.type('set');
      unsubscribe.attr('node', node);
      unsubscribe.attr('jid',  this.connection.getJID());
      iq.addChild(pubsub.addChild(unsubscribe));

      var that = this;
      var cb = function () {
        unsubscriptionHandler.apply(that, arguments);
      };
      this.connection.send(iq.toString(), cb, [node, callbacks]);
    },

    /**
     * Get the items on a PubSub node.
     *
     * @param {String} node The node ID to subscribe to
     * @param {Object} [callbacks] an object supplying functions for 'onSuccess', and 'onError'
     *   @param {Function} [callbacks.onSuccess] The success callback.
     *     @param {OX.Item[]} [callbacks.onSuccess.items] The items on the PubSub node.
     *   @param {Function} [callbacks.onError] The error callback.
     *     @param {OX.PacketAdapter} [callbacks.onSuccess.packet] The recieved packet.
     * @returns {void}
     *
     * @example
     *   service.getItems('/', {
     *     onSuccess: function (items) {},
     *     onError:   function (errorPacket) {}
     *   });
     */
    getItems: function (node, callbacks) {
      var iq     = OX.XML.XMPP.IQ.extend(),
          pubsub = OX.XML.Element.extend({name:  'pubsub',
                                          xmlns: 'http://jabber.org/protocol/pubsub'}),
          items  = OX.XML.Element.extend({name: 'items'});

      iq.to(this.pubSubURI.path);
      iq.type('get');
      items.attr('node', node);
      iq.addChild(pubsub.addChild(items));

      var that = this;
      var cb = function () {
        getItemsHandler.apply(that, arguments);
      };
      this.connection.send(iq.toString(), cb, [callbacks]);
    },

    /**
     * Registers a handler for an event.
     *
     * Only one handler can be registered for a given event at a time.
     *
     * @param {String} event One of the strings 'onPending', 'onSubscribed', 'onUnsubscribed', 'onPublish' or 'onRetract'.
     * @param {Function} handler A function which accepts one argument, which is the packet response.
     * @param {Object} [target] The object to apply as the value 'this' in the function.
     * @returns {void}
     * @example
     *   service.registerHandler('onPublish', function (item) {});
     */
    registerHandler: function (event, handler, target) {
      this._subscriptionHandlers[event] = function () {
        target = target || this;
        handler.apply(target, arguments);
      };
    },

    /**
     * Unregisters an event handler.
     *
     * @param {String} event One of the strings 'onPending', 'onSubscribed', 'onUnsubscribed', 'onPublish' or 'onRetract'.
     * @returns {void}
     *
     * @example
     *   service.unregisterHandler('onPublish', handlerFunction);
     */
    unregisterHandler: function (event) {
    },

    /** @private
     * Turn a packet into an item for this service. By default, this
     * does nothing. You must override this within the object being
     * extended for useful behavior.
     * @param {Element|Node} element The incoming element to transform to an {@link OX.Item}
     * @returns {OX.Item} The XML as an OX Item.
     */
    itemFromElement: function (element) {
      throw new OX.Error("You MUST override OX.Subscribable#itemFromElement " +
                         "so it returns an OX.Item.");
    },

    /**
     * This handler is called when we get a pending subscription
     * notification.
     * @name OX.Mixin.Subscribable#onPending
     * @event
     * @param {OX.URI.Base} uri The URI of the subscription request, after redirects.
     * @param {OX.PacketAdapter} packet The packet that caused the 'onPending' event.
     * @returns {void}
     */

    /**
     * This handler is called when we get a completed subscription.
     * @name OX.Mixin.Subscribable#onSubscribed
     * @event
     * @param {OX.URI.Base} uri The URI of the subscription request, after redirects.
     * @param {OX.PacketAdapter} packet The packet that caused the 'onSubscribed' event.
     * @returns {void}
     */

    /**
     * This handler is called when we our subscription is removed.
     * @name OX.Mixin.Subscribable#onUnsubscribed
     * @event
     * @param {OX.URI.Base} uri The node we were unsubscribed from.
     * @param {OX.PacketAdapter} packet The packet that causded the 'onUnsubscribed' event.
     * @returns {void}
     */

    /**
     * This handler is called when an item is published.
     * @name OX.Mixin.Subscribable#onPublish
     * @event
     * @param {OX.Item} item The published item.
     * @param {OX.PacketAdapter} packet The packet that caused the 'onRetract' event.
     * @returns {void}
     */

    /**
     * This handler is called when an item is retracted.
     * @name OX.Mixin.Subscribable#onRetract
     * @event
     * @param {OX.URI.Base} uri The URI of the retracted item.
     * @param {OX.PacketAdapter} packet The packet that caused the 'onRetract' event.
     * @returns {void}
     */

    /**
     * @private
     * Handlers for various subscription related events.
     */
    _subscriptionHandlers: {

      onPending: function (uri) {},

      onSubscribed: function (uri) {},

      onUnsubscribed: function (uri) {},

      onPublish: function (item) {},

      onRetract: function (uri) {}
    }
  };
}());
