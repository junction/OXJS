/**
 * Namespace for service mixins.
 *
 * These objects should not be used directly, but only when
 * instantiated from an OX.Connection after calling initConnection.
 *
 * @namespace
 */
OX.Services = {};

/**
 * Namespace for auth related services.
 * @namespace
 * @extends OX.Base
 * @requires connection property inherited from an OX.ConnectionAdapter.
 */
OX.Services.Auth = OX.Base.extend(/** @lends OX.Services.Auth */{
  /**
   * Authenticate +jid+ for +address+ with +password+
   *
   * @param {String} address The SIP address to authenticate as.
   * @param {String} password The web password for +address+.
   * @param {String} [jid] The JID to authorize for +address+. If unspecified, use the current JID.
   */
  authenticatePlain: function (address, password, jid) {
    // TODO: parse this out of commands uri.
    var jidStr = jid ? '<field var="jid"><value>' + jid + '</value></field>' : '';
    var xml = '<iq type="set" to="commands.auth.xmpp.onsip.com"><command xmlns="http://jabber.org/protocol/commands" node="authenticate-plain"><x xmlns="jabber:x:data" type="submit"><field var="sip-address"><value>' + address + '</value></field><field var="password"><value>'+ password +'</value></field>' + jidStr + '</x></command></iq>';

    this.connection.send(xml, function () {}, []);
  }
});

/**
 * Namespace for active-calls related services.
 * @namespace
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable#subscribe as #subscribe
 * @borrows OX.Mixins.Subscribable#unsubscribe as #unsubscribe
 * @borrows OX.Mixins.Subscribable#getItems as #getItems
 * @borrows OX.Mixins.Subscribable#registerHandler as #registerHandler
 * @borrows OX.Mixins.Subscribable#unregisterHandler as #unregisterHandler
 * @requires connection property inherited from an OX.ConnectionAdapter.
 */
OX.Services.ActiveCalls = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.ActiveCalls */ {
  /**
   * URI for this PubSub service.
   */
  pubSubURI: 'xmpp:pubsub.active-calls.xmpp.onsip.com',

  /**
   */
  commandURIs: {
    /**
     * URI for create Ad Hoc commnd.
     */
    create: 'xmpp:commands.active-calls.xmpp.onsip.com?;node=create',

    /**
     * URI for transfer Ad Hoc commnd.
     */
    transfer: 'xmpp:commands.active-calls.xmpp.onsip.com?;node=transfer',

    /**
     * URI for hangup Ad Hoc commnd.
     */
    hangup: 'xmpp:commands.active-calls.xmpp.onsip.com?;node=terminate'
  },

  /**
   * Active Call Item.
   * @name OX.Services.ActiveCalls.Item
   * @namespace
   * @extends OX.Item
   * @borrows OX.Mixins.CallDialog#transfer as #transfer
   * @borrows OX.Mixins.CallDialog#hangup as #hangup
   * @borrows OX.Mixins.CallLabeler#label as #label
   */
  Item: OX.Item.extend(OX.Mixins.CallDialog, OX.Mixins.CallLabeler, /** @lends OX.Services.ActiveCalls.Item */{
    dialogState: null,
    callID: null,
    fromURI: null,
    toURI: null,
    uacAOR: null,
    uasAOR: null,
    fromTag: null,
    toTag: null
  }),

  /**
   * Create a new call.
   *
   * @param {String} to the SIP address to terminate the call at
   * @param {String} from the SIP address to originate the call from
   */
  create: function (to, from) {}
});

/**
 * Namespace for user agent related services.
 * @namespace
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable#subscribe as #subscribe
 * @borrows OX.Mixins.Subscribable#unsubscribe as #unsubscribe
 * @borrows OX.Mixins.Subscribable#getItems as #getItems
 * @borrows OX.Mixins.Subscribable#registerHandler as #registerHandler
 * @borrows OX.Mixins.Subscribable#unregisterHandler as #unregisterHandler
 * @requires connection property inherited from an OX.ConnectionAdapter.
 */
OX.Services.UserAgents = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.UserAgents */{});

/**
 * Namespace for voicemail related services.
 * @namespace
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable#subscribe as #subscribe
 * @borrows OX.Mixins.Subscribable#unsubscribe as #unsubscribe
 * @borrows OX.Mixins.Subscribable#getItems as #getItems
 * @borrows OX.Mixins.Subscribable#registerHandler as #registerHandler
 * @borrows OX.Mixins.Subscribable#unregisterHandler as #unregisterHandler
 * @requires connection property inherited from an OX.ConnectionAdapter.
 */
OX.Services.Voicemail = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.Voicemail */{});

/**
 * Namespace for directory related services.
 * @namespace
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable#subscribe as #subscribe
 * @borrows OX.Mixins.Subscribable#unsubscribe as #unsubscribe
 * @borrows OX.Mixins.Subscribable#getItems as #getItems
 * @borrows OX.Mixins.Subscribable#registerHandler as #registerHandler
 * @borrows OX.Mixins.Subscribable#unregisterHandler as #unregisterHandler
 * @requires connection property inherited from an OX.ConnectionAdapter.
 */
OX.Services.Directories = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.Directories */{});

/**
 * Namespace for preference related services.
 * @namespace
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable#subscribe as #subscribe
 * @borrows OX.Mixins.Subscribable#unsubscribe as #unsubscribe
 * @borrows OX.Mixins.Subscribable#getItems as #getItems
 * @borrows OX.Mixins.Subscribable#registerHandler as #registerHandler
 * @borrows OX.Mixins.Subscribable#unregisterHandler as #unregisterHandler
 * @requires connection property inherited from an OX.ConnectionAdapter.
 */
OX.Services.Preferences = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.Preferences */{});

/**
 * Namespace for recent call related services.
 * @namespace
 * @extends OX.Base
 * @borrows OX.Mixins.Subscribable#subscribe as #subscribe
 * @borrows OX.Mixins.Subscribable#unsubscribe as #unsubscribe
 * @borrows OX.Mixins.Subscribable#getItems as #getItems
 * @borrows OX.Mixins.Subscribable#registerHandler as #registerHandler
 * @borrows OX.Mixins.Subscribable#unregisterHandler as #unregisterHandler
 * @requires connection property inherited from an OX.ConnectionAdapter.
 */
OX.Services.RecentCalls = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.RecentCalls */{});
