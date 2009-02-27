/**
 * Connection object to use for all OXJS connections. The +initConnection+
 * method MUST be called after extending this object.
 *
 * @class
 * @extends OX.Base
 */
OX.Connection = OX.Base.extend(/** @lends OX.Connection# */{
  /**
   * Initialize the service properties.
   */
  initConnection: function () {
    /** @type OX.Auth */
    this.Auth        = OX.Auth.extend({connection: this.connection});

    /** @type OX.ActiveCalls */
    this.ActiveCalls = OX.ActiveCalls.extend({connection: this.connection});

    /** @type OX.UserAgents */
    this.UserAgents  = OX.UserAgents.extend({connection: this.connection});

    /** @type OX.Voicemail */
    this.Voicemail   = OX.Voicemail.extend({connection: this.connection});

    /** @type OX.Directories */
    this.Directories = OX.Directories.extend({connection: this.connection});

    /** @type OX.Preferences */
    this.Preferences = OX.Preferences.extend({connection: this.connection});

    /** @type OX.RecentCalls */
    this.RecentCalls = OX.RecentCalls.extend({connection: this.connection});

    return this;
  }
});
