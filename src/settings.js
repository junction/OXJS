/**
 * Namespace for OX settings.
 *
 * This provides top-level knobs to tweak in order to adjust behavior.
 */
OX.Settings = OX.Base.extend(/** @lends OX.Settings*/{
  /**
   * Various URIs of interest.
   */
  URIs: {
    /**
     * URIs for Ad Hoc Commands.
     */
    command: {
      /** URI for Ad Hoc Command to create a call. */
      createCall: 'xmpp:commands.active-calls.xmpp.onsip.com?;node=create',
      /** URI for Ad Hoc Command to transfer a call. */
      transferCall: 'xmpp:commands.active-calls.xmpp.onsip.com?;node=transfer',
      /** URI for Ad Hoc Command to terminate a call. */
      terminateCall: 'xmpp:commands.active-calls.xmpp.onsip.com?;node=terminate',
      /** URI for Ad Hoc Command to cancel a call. */
      cancelCall: 'xmpp:commands.active-calls.xmpp.onsip.com?;node=cancel',
      /** URI for Ad Hoc Command to label a call. */
      labelCall: 'xmpp:commands.recent-calls.xmpp.onsip.com?;node=label',

      /** URI for Ad Hoc Command to authorize with a plain-text password. */
      authorizePlain: 'xmpp:commands.auth.xmpp.onsip.com?;node=authorize-plain',

      /** URI for Ad Hoc Command to push roster groups. */
      pushRosterGroups: 'xmpp:commands.rosters.xmpp.onsip.com?;node=push-roster-groups'
    },

    /**
     * URIs for PubSub.
     */
    pubSub: {
      /** URI for active call PubSub service. */
      activeCalls: 'xmpp:pubsub.active-calls.xmpp.onsip.com',
      /** URI for organization directory PubSub service. */
      directories: 'xmpp:pubsub.directories.xmpp.onsip.com',
      /** URI for user preferences PubSub service. */
      preferences: 'xmpp:pubsub.preferences.xmpp.onsip.com',
      /** URI for recent call PubSub service. */
      recentCalls: 'xmpp:pubsub.recent-calls.xmpp.onsip.com',
      /** URI for user agent PubSub service. */
      userAgents: 'xmpp:pubsub.user-agents.xmpp.onsip.com',
      /** URI for voicemail PubSub service. */
      voicemail: 'xmpp:pubsub.voicemail.xmpp.onsip.com'
    }
  }
});