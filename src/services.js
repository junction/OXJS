/**
 * Namespace for service mixins.
 *
 * These objects should not be used directly, but only when
 * instantiated from an {@link OX.Connection} after calling
 * {@link OX.Connection#initConnection}.
 *
 * @namespace
 *
 * @see OX.Connection
 */
OX.Services = {};

/**
 * Namespace for auth related services.
 * @namespace
 * @extends OX.Base
 * @requires connection property inherited from an {@link OX.Connection}.
 */
OX.Services.Auth = OX.Base.extend(/** @lends OX.Services.Auth */{
  /** */
  commandURIs: {
    /** URI for authorize-plain Ad Hoc commnd. */
    authorizePlain: 'xmpp:commands.auth.xmpp.onsip.com?;node=authorize-plain'
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
   *
   * @example
   * ox.Auth.authorizePlain('sip@example.com', 'password', 'jid@example.com', {
   *   onSuccess: function () {},
   *   onError:   function (error) {}
   * });
   */
  authorizePlain: function (address, password, jid) {
    var iq    = OX.XMPP.IQ.extend(),
        cmd   = OX.XMPP.Command.extend(),
        xData = OX.XMPP.XDataForm.extend();

    var callbacks = {};
    if (arguments.length > 0 && arguments[arguments.length - 1])
      callbacks = arguments[arguments.length - 1];

    iq.to('commands.auth.xmpp.onsip.com');
    iq.type('set');
    cmd.node('authorize-plain');
    xData.type('submit');
    xData.addField('sip-address', address);
    xData.addField('password', password);
    if (jid)
      xData.addField('jid', jid);

    iq.addChild(cmd.addChild(xData));

    this.connection.send(iq.toString(), function (packet) {
      if (!packet)
        return;

      if (packet.getType() === 'error' && callbacks.onError) {
        callbacks.onError(packet);
      } else if (callbacks.onSuccess) {
        callbacks.onSuccess(packet);
      }
    }, []);
  }
});

/**
 * Namespace for active-calls related services.
 * @namespace
 * @extends OX.Base
 * @extends OX.Mixins.Subscribable
 * @requires connection property inherited from an {@link OX.Connection}.
 */
OX.Services.ActiveCalls = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.ActiveCalls */ {
  /**
   * URI for this PubSub service.
   */
  pubSubURI: 'xmpp:pubsub.active-calls.xmpp.onsip.com',

  /** */
  commandURIs: {
    /** URI for create Ad Hoc commnd. */
    create: 'xmpp:commands.active-calls.xmpp.onsip.com?;node=create',

    /** URI for transfer Ad Hoc commnd. */
    transfer: 'xmpp:commands.active-calls.xmpp.onsip.com?;node=transfer',

    /** URI for hangup Ad Hoc commnd. */
    hangup: 'xmpp:commands.active-calls.xmpp.onsip.com?;node=terminate'
  },

  /**
   * Active Call Item.
   * @name OX.Services.ActiveCalls.Item
   * @namespace
   * @extends OX.Item
   * @extends OX.Mixins.CallDialog
   * @extends OX.Mixins.CallLabeler
   */
  Item: OX.Item.extend(OX.Mixins.CallDialog, OX.Mixins.CallLabeler, /** @lends OX.Services.ActiveCalls.Item# */{
    /** The current dialog state. */
    dialogState: null,

    /** The call ID of this call. */
    callID: null,

    /** The URI of the call originator. */
    fromURI: null,

    /** The URI of the call terminator. */
    toURI: null,

    /** The Address of Record for the User Agent Client. */
    uacAOR: null,

    /** The Address of Record for the User Agent Server. */
    uasAOR: null,

    /** The tag for the originating leg of the call. */
    fromTag: null,

    /** The tag for the terminating leg of the call. */
    toTag: null
  }),

  /**
   * Returns an OX.Service.ActiveCalls.Item from an XML Document.
   * This method should be called once for each item to be constructed.
   * If a DOMElement contains more than one item node, only the first
   * item node will be returned as an OX.Service.ActiveCalls.Item
   *
   * @param {DOMElement} element
   * @returns {OX.Services.ActiveCalls.Item} item
   */
  itemFromElement: function (element) {
    if (!element)
      return undefined;

    var activeCallNode = element.getElementsByTagName('active-call'),
        attrs          = {connection: this.connection};

    if (!activeCallNode || !activeCallNode[0])
      return undefined;

    var childNodes = activeCallNode[0].childNodes;

    function getFirstNodeValue(node) {
      var child = node.firstChild;
      if (child && child.nodeValue == null && child.firstChild) {
        return arguments.callee(child);
      } else if (child && child.nodeValue) {
        return child.nodeValue;
      }
      return undefined;
    }

    for (var i = 0, len = childNodes.length; i < len; i++) {
      var node = childNodes[i];

      if (!node.nodeName)
        continue;

      switch (node.nodeName.toLowerCase()) {
      case 'dialog-state':
        attrs.dialogState = node.firstChild.nodeValue;
        break;
      case 'uac-aor':
        attrs.uacAOR = node.firstChild.nodeValue;
        break;
      case 'uas-aor':
        attrs.uasAOR = node.firstChild.nodeValue;
        break;
      case 'call-id':
        attrs.callID = node.firstChild.nodeValue;
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
        attrs.toTag = node.firstChild.nodeValue;
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
   * @param {Object} [cb] An object supplying callback functions for 'onSuccess', and 'onError'.
   */
  create: function() {
    /**
     * @private
     */
    var getCreateURI = function() {
      if (arguments.callee._cached === undefined) {
        arguments.callee._cached = OX.URI.parse(OX.Services.ActiveCalls.commandURIs.create);
      }
      return arguments.callee._cached;
    };

    return function (to, from, cb) {
      var uri   = getCreateURI(),
          xData = OX.XMPP.XDataForm.create({type: 'submit'}),
          cmd   = OX.XMPP.Command.create({node: uri.queryParam('node')}, xData),
          iq    = OX.XMPP.IQ.create({to: uri.path, type: 'set'}, cmd);

      xData.addField('to', to);
      xData.addField('from', from);

      cb = cb || {};

      this.connection.send(iq.toString(), function(packet) {
        if(!packet) return;

        if(packet.getType() === 'error' && cb.onError && cb.onError.constructor == Function) {
          cb.onError(packet);
        } else if(cb.onSuccess && cb.onSuccess.constructor == Function) {
          cb.onSuccess(packet);
        }
      }, []);

    };
  }()
});

/**
 * Namespace for user agent related services.
 * @namespace
 * @extends OX.Base
 * @extends OX.Mixins.Subscribable
 * @requires connection property inherited from an {@link OX.Connection}.
 */
OX.Services.UserAgents = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.UserAgents */{
  /**
   * URI for this PubSub service.
   */
  pubSubURI: 'xmpp:pubsub.user-agents.xmpp.onsip.com',

  /**
   * User Agent Item.
   * @name OX.Services.UserAgents.Item
   * @namespace
   * @extends OX.Item
   */
  Item: OX.Item.extend(/** @lends OX.Services.UserAgents.Item# */{
    /** The contact of this user agent. */
    contact:  null,

    /** The time this user agent last registered. */
    received: null,

    /** The user agent identifier string. */
    device:   null,

    /** The time at which the user agent registration will expire. */
    expires:  null
  }),

  itemFromElement: function (element) {
    if (!element)
      return undefined;

    var userAgentNode = element.getElementsByTagName('user-agent'),
        attrs         = {connection: this.connection};

    if (!userAgentNode || !userAgentNode[0])
      return undefined;
    var children = userAgentNode[0].childNodes;

    for (var i = 0, len = children.length; i < len; i++) {
      var node = children[i];

      if (!node.nodeName)
        continue;

      switch (node.nodeName.toLowerCase()) {
      case 'contact':
        attrs.contact = node.firstChild.nodeValue;
        break;
      case 'received':
        attrs.received = node.firstChild.nodeValue;
        break;
      case 'device':
        attrs.device = node.firstChild.nodeValue;
        break;
      case 'expires':
        attrs.expires = node.firstChild.nodeValue;
        break;
      }
    }

    return this.Item.extend(attrs);
  }
});

/**
 * Namespace for voicemail related services.
 * @namespace
 * @extends OX.Base
 * @extends OX.Mixins.Subscribable
 * @requires connection property inherited from an {@link OX.Connection}.
 */
OX.Services.Voicemail = OX.Base.extend(OX.Mixins.Subscribable, function () {
  function itemType(element) {
    if (!element)
      return undefined;
    else if (element.getElementsByTagName('voicemail').length > 0)
      return 'voicemail';
    else if (element.getElementsByTagName('labels').length > 0)
      return 'labels';
    else
      return undefined;
  }

  function voicemailItem(element) {
    if (!element)
      return undefined;

    var rc = {};
    var voicemailNode = element.getElementsByTagName('voicemail');

    if (!voicemailNode || !voicemailNode[0])
      return undefined;

    var children = voicemailNode[0].childNodes;
    for (var i = 0, len = children.length; i < len; i++) {
      var node = children[i];

      if (!node.nodeName)
        continue;

      switch (node.nodeName.toLowerCase()) {
      case 'mailbox':
        rc.mailbox = parseInt(node.firstChild.nodeValue);
        break;
      case 'caller-id':
        rc.callerID = node.firstChild.nodeValue;
        break;
      case 'created':
        rc.created = node.firstChild.nodeValue;
        break;
      case 'duration':
        rc.duration = parseInt(node.firstChild.nodeValue);
        break;
      case 'labels':
        var labels = [];
        for (var j = 0, jlen = node.childNodes.length; j < jlen; j++) {
          var elt = node.childNodes[j];
          if (elt.tagName && elt.tagName == 'label')
            labels.push(elt.firstChild.nodeValue);
        }
        rc.labels = labels;
        break;
      }
    }
    return rc;
  }

  function labelItem(element) {
    if (!element)
      return undefined;

    var rc = {labels: []};
    var labelsNode = element.getElementsByTagName('labels');

    if (!labelsNode || !labelsNode[0])
      return undefined;

    var children = labelsNode[0].childNodes;
    for (var i = 0, len = children.length; i < len; i++) {
      var node = children[i];

      if (node.nodeName && node.nodeName == 'label')
        rc.labels.push(node.firstChild.nodeValue);
    }
    return rc;
  }

  return /** @lends OX.Services.Voicemail */{
    /**
     * URI for this PubSub service.
     */
    pubSubURI: 'xmpp:pubsub.voicemail.xmpp.onsip.com',

    /**
     * Voicemail Item.
     * @name OX.Services.Voicemail.Item
     * @namespace
     * @extends OX.Item
     */
    Item: OX.Item.extend(/** @lends OX.Services.Voicemail.Item# */{
      /** The mailbox number for this voicemail. */
      mailbox:  null,

      /** The caller ID of this voicemail. */
      callerID: null,

      /** The time this voicemail was created. */
      created:  null,

      /** How long, in seconds, this voicemail is. */
      duration: null,

      /** An array of labels for this voicemail. */
      labels:   null
    }),

    /**
     * Voicemail Label Item
     *
     * @name OX.Services.Voicemail.LabelItem
     * @namespace
     * @extends OX.Item
     */
    LabelItem: OX.Item.extend(/** @lends OX.Services.Voicemail.LabelItem#*/{
      /** An array of all voicemail labels. */
      labels: null
    }),

    itemFromElement: function (element) {
      var rc, item;

      switch (itemType(element)) {
      case 'voicemail':
        item = voicemailItem(element);
        if (item)
          rc = this.Item.extend(item, {connection: this.connection});
        break;
      case 'labels':
        item = labelItem(element);
        if (item)
          rc = this.LabelItem.extend(item, {connection: this.connection});
        break;
      }

      return rc;
    }
  };
}());

/**
 * Namespace for directory related services.
 * @namespace
 * @extends OX.Base
 * @extends OX.Mixins.Subscribable
 * @requires connection property inherited from an {@link OX.Connection}.
 */
OX.Services.Directories = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.Directories */{});

/**
 * Namespace for preferences related services.
 * @namespace
 * @extends OX.Base
 * @extends OX.Mixins.Subscribable
 * @requires connection property inherited from an {@link OX.Connection}.
 */
OX.Services.Preferences = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.Preferences */{});

/**
 * Namespace for recent call related services.
 * @namespace
 * @extends OX.Base
 * @extends OX.Mixins.Subscribable
 * @requires connection property inherited from an {@link OX.Connection}.
 */
OX.Services.RecentCalls = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.RecentCalls */{
  /** */
  commandURIs: {
    /** URI for label Ad Hoc commnd. */
    label: 'xmpp:commands.recent-calls.xmpp.onsip.com?;node=label'
  }
});
