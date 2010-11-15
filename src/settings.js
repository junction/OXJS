/**
 * @namespace
 * Namespace for OX settings.
 *
 * This provides top-level knobs to tweak in order to adjust behavior.
 */
OX.Settings = OX.Base.extend(/** @lends OX.Settings*/{

  /**
   * @namespace
   * Various URIs of interest.
   */
  URIs: {
    /**
     * @namespace
     * URIs for entities.
     */
    entity: {
      /** URI for Authentication with the XMPP API */
      auth: OX.URI.parse('xmpp:commands.auth.xmpp.onsip.com')
    },

    /**
     * @namespace
     * URIs for Ad Hoc Commands.
     */
    command: {
      /** URI for Ad Hoc Command to create a call. */
      createCall: OX.URI.parse('xmpp:commands.active-calls.xmpp.onsip.com?;node=create'),
      /** URI for Ad Hoc Command to transfer a call. */
      transferCall: OX.URI.parse('xmpp:commands.active-calls.xmpp.onsip.com?;node=transfer'),
      /** URI for Ad Hoc Command to terminate a call. */
      terminateCall: OX.URI.parse('xmpp:commands.active-calls.xmpp.onsip.com?;node=terminate'),
      /** URI for Ad Hoc Command to cancel a call. */
      cancelCall: OX.URI.parse('xmpp:commands.active-calls.xmpp.onsip.com?;node=cancel'),
      /** URI for Ad Hoc Command to label a call. */
      labelCall: OX.URI.parse('xmpp:commands.recent-calls.xmpp.onsip.com?;node=label'),

      /** URI for Ad Hoc Command to cache a voicemail. */
      cacheVoicemail: OX.URI.parse('xmpp:commands.voicemail.xmpp.onsip.com?;node=cache'),
      /** URI for Ad Hoc Command to delete a voicemail. */
      deleteVoicemail: OX.URI.parse('xmpp:commands.voicemail.xmpp.onsip.com?;node=delete'),

      /** URI for Ad Hoc Command to authorize with a plain-text password. */
      authorizePlain: OX.URI.parse('xmpp:commands.auth.xmpp.onsip.com?;node=authorize-plain'),

      /** URI for Ad Hoc Command to push roster groups. */
      pushRosterGroups: OX.URI.parse('xmpp:commands.rosters.xmpp.onsip.com?;node=push-roster-groups')
    },

    /**
     * @namespace
     * URIs for PubSub.
     */
    pubSub: {
      /** URI for active call PubSub service. */
      activeCalls: OX.URI.parse('xmpp:pubsub.active-calls.xmpp.onsip.com'),
      /** URI for organization directory PubSub service. */
      directories: OX.URI.parse('xmpp:pubsub.directories.xmpp.onsip.com'),
      /** URI for user preferences PubSub service. */
      preferences: OX.URI.parse('xmpp:pubsub.preferences.xmpp.onsip.com'),
      /** URI for recent call PubSub service. */
      recentCalls: OX.URI.parse('xmpp:pubsub.recent-calls.xmpp.onsip.com'),
      /** URI for user agent PubSub service. */
      userAgents: OX.URI.parse('xmpp:pubsub.user-agents.xmpp.onsip.com'),
      /** URI for voicemail PubSub service. */
      voicemail: OX.URI.parse('xmpp:pubsub.voicemail.xmpp.onsip.com')
    },

    /**
     * @namespace
     * URIs for Presence.
     */
    presence: {
      /** URI for sending directed Presence. */
      userAgents: OX.URI.parse('xmpp:commands.user-agents.xmpp.onsip.com')
    }
  }
});
