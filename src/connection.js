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
    this.Auth        = OX.Services.Auth.extend({connection: this.connection});

    /** @type OX.ActiveCalls */
    this.ActiveCalls = OX.Services.ActiveCalls.extend({connection: this.connection});

    /** @type OX.ActiveCalls.Item */
    this.ActiveCalls.Item = OX.Services.ActiveCalls.Item.extend({connection: this.connection});

    /** @type OX.UserAgents */
    this.UserAgents  = OX.Services.UserAgents.extend({connection: this.connection});

    /** @type OX.Voicemail */
    this.Voicemail   = OX.Services.Voicemail.extend({connection: this.connection});

    /** @type OX.Directories */
    this.Directories = OX.Services.Directories.extend({connection: this.connection});

    /** @type OX.Preferences */
    this.Preferences = OX.Services.Preferences.extend({connection: this.connection});

    /** @type OX.RecentCalls */
    this.RecentCalls = OX.Services.RecentCalls.extend({connection: this.connection});

    return this;
  }
});
