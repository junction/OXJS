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
   *
   * @example
   * ox.Auth.authenticatePlain('sip@example.com', 'password', 'jid@example.com');
   */
  authenticatePlain: function (address, password, jid) {
    var
      iq = OX.XMPP.IQ.extend(),
      cmd = OX.XMPP.Command.extend(),
      xData = OX.XMPP.XDataForm.extend();

    iq.to('commands.auth.xmpp.onsip.com');
    iq.type('set');
    cmd.node('authenticate-plain');
    xData.type('submit');
    xData.addField('sip-address',address);
    xData.addField('password',password);
    if(jid) xData.addField('jid',jid);

    iq.addChild(cmd.addChild(xData));

    this.connection.send(iq.toString(), function () {}, []);
  }
});

/**
 * Namespace for active-calls related services.
 * @namespace
 * @extends OX.Base
 * @extends OX.Mixins.Subscribable
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
   * @extends OX.Mixins.CallDialog
   * @extends OX.Mixins.CallLabeler
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
 * @extends OX.Mixins.Subscribable
 * @requires connection property inherited from an OX.ConnectionAdapter.
 */
OX.Services.UserAgents = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.UserAgents */{
  /**
   * User Agent Item.
   * @name OX.Services.UserAgents.Item
   * @namespace
   * @extends OX.Item
   */
  Item: OX.Item.extend({contact:  null,
                        received: null,
                        device:   null,
                        expires:  null,
                        event:    null})
});

/**
 * Namespace for voicemail related services.
 * @namespace
 * @extends OX.Base
 * @extends OX.Mixins.Subscribable
 * @requires connection property inherited from an OX.ConnectionAdapter.
 */
OX.Services.Voicemail = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.Voicemail */{});

/**
 * Namespace for directory related services.
 * @namespace
 * @extends OX.Base
 * @extends OX.Mixins.Subscribable
 * @requires connection property inherited from an OX.ConnectionAdapter.
 */
OX.Services.Directories = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.Directories */{});

/**
 * Namespace for preference related services.
 * @namespace
 * @extends OX.Base
 * @extends OX.Mixins.Subscribable
 * @requires connection property inherited from an OX.ConnectionAdapter.
 */
OX.Services.Preferences = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.Preferences */{});

/**
 * Namespace for recent call related services.
 * @namespace
 * @extends OX.Base
 * @extends OX.Mixins.Subscribable
 * @requires connection property inherited from an OX.ConnectionAdapter.
 */
OX.Services.RecentCalls = OX.Base.extend(OX.Mixins.Subscribable, /** @lends OX.Services.RecentCalls */{});
