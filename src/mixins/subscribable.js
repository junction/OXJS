/**
 * @namespace
 * Subscribable mixin.
 *
 * @requires connection A property which is an {@link OX.ConnectionAdapter} object on receiving object.
 * @requires pubSubURI The URI of the PubSub service.
 * @requires itemFromPacket A function which takes a packet argument and returns an item.
 */
OX.Mixin.Subscribable = (function () {
  /**#nocode+*/
  var MAX_REDIRECTS = 5,
    cbDefault = {
      onSuccess: function () {}.inferior(),
      onError: function () {}.inferior()
    }, doSubscribe, doGetSubscriptions, doConfigureNodeSubscription; // fix circular ref for jslint

  function packetType(element) {
    if (!element) {
      return null;
    }

    switch (element.tagName) {
    case 'subscription':
      return element.getAttribute('subscription');
    case 'items':
      if (element.firstChild.tagName === 'retract') {
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
          items = document.firstChild.firstChild;

      return OX.URI.fromObject({path: from,
                                query: ';node=' + node + ';item=' + itemID});
    }
    function getPublishTime(element) {
      var firstChild  = element.firstChild,
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
        fChild = e && e.firstChild,
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
          sub    = elt.firstChild.firstChild,
          node   = sub.getAttribute('node') || '/';

      return OX.URI.fromObject({path:   from, query: ';node=' + node});
    }

    function retractURI() {
      var elt    = packet.getNode(),
          from   = elt.getAttribute('from'),
          items  = elt.getElementsByTagName('items')[0],
          node   = items.getAttribute('node') || '/',
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
    case 'none':
      if (this._subscriptionHandlers.onUnsubscribed) {
        var unsubscribedURI = subscriptionURI();
        this._subscriptionHandlers.onUnsubscribed(unsubscribedURI);
      }
      break;
    case 'publish':
      if (this._subscriptionHandlers.onPublish) {
        var items = convertItems.call(this, packet.getNode());
        for (var i = 0, len = items.length; i < len; i++) {
          this._subscriptionHandlers.onPublish(items[i]);
        }
      }
      break;
    case 'retract':
      if (this._subscriptionHandlers.onRetract) {
        this._subscriptionHandlers.onRetract(retractURI());
      }
      break;
    }
  }

  function jidHandler(packet) {
    var event = packet.getNode().getElementsByTagName('event')[0];
    if (!event) {
      return;
    }

    fireEvent.call(this, packetType(event.firstChild), packet);
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
            subscription = pubSub.firstChild;

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
   * @type {String}
   */

  /**
   * @name OX.Subscription#jid
   * @field
   * @description
   * The required JID that the subscription is on.
   * @type {String}
   */

  /**
   * @name OX.Subscription#subscription
   * @field
   * @description
   * The optional subscription state of the subscription.
   * One of 'none', 'pending', 'subscribed', or 'unconfigured'.
   * @type {String}
   */

  /**
   * @name OX.Subscription#subid
   * @field
   * @description
   * The optional subscription id.
   * @type {String}
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
        this.connection.registerJIDHandler(uri.path, handler);
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
     * @param {OX.Subscriptions} subscription The subscription to configure.
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
     *
     * @see <a href="http://xmpp.org/extensions/xep-0060.html#subscriber-configure-submit">XEP-0060: Subscriber Configuration</a>
     */
    configureNodeSubscription: function (subscription, subOptions, callbacks) {
      doConfigureNodeSubscription.apply(this, arguments);
    },

    /**
     * Subscribe to a nade.
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
     *
     * @example
     *   var subOptions = {expires: new Date()};
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
        var tmpOpts = {
          strict: true,
          node: node
        };

        this.getSubscriptions({
          onSuccess: function(requestedURI, finalURI, subs, packet) {
            var resubscribed = false,
              finalNode = finalURI.queryParam('node');

            for (var i=0,l=subs.length;i<l;i++) {
              if (subs[i].subscription == 'subscribed' && subs[i].node == finalNode) {
                that.configureNodeSubscription(subs[i],subOptions,callbacks);
                resubscribed = true;
                break;
              }
            }

            if (!resubscribed) {
              options.reuseSubscriptions = false;
              that.subscribe(node,subOptions,callbacks,options);
            }
          },
          onError: callbacks.onError
        },tmpOpts);
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
     *
     * @example
     *   service.registerHandler('onPublish', function (item) {});
     */
    registerHandler: function (event, handler) {
      this._subscriptionHandlers[event] = handler;
    },

    /**
     * Unregisters an event handler.
     *
     * @param {String} event One of the strings 'onPending', 'onSubscribed', 'onUnsubscribed', 'onPublish' or 'onRetract'.
     *
     * @example
     *   service.unregisterHandler('onPublish', handlerFunction);
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
     * @private
     * Handlers for various subscription related events.
     */
    _subscriptionHandlers: {
      /**
       * @private
       * This handler is called when we get a pending subscription
       * notification.
       *
       * @param {OX.URI.Base} uri The URI of the subscription request, after redirects.
       */
      onPending: function (uri) {},

      /**
       * @private
       * This handler is called when we get a completed subscription.
       *
       * @param {OX.URI.Base} uri The URI of the subscription request, after redirects.
       */
      onSubscribed: function (uri) {},

      /**
       * @private
       * This handler is called when we our subscription is removed.
       *
       * @param {OX.URI.Base} uri The node we were unsubscribed from.
       */
      onUnsubscribed: function (uri) {},

      /**
       * @private
       * This handler is called when an item is published.
       *
       * @param {OX.Item} item The published item.
       */
      onPublish: function (item) {},

      /**
       * @private
       * This handler is called when an item is retracted.
       *
       * @param {OX.URI.Base} uri The URI of the retracted item.
       */
      onRetract: function (uri) {}
    }
  };
}());
