/**
 * Connection object to use for all OXJS connections. The +initConnection+
 * method MUST be called after extending this object.
 *
 * @class
 * @extends OX.Base
 * @property {OX.Services.Auth} Auth#
 * @property {OX.Services.Auth} ActiveCalls#
 * @property {OX.Services.Auth} UserAgents#
 * @property {OX.Services.Auth} Voicemail#
 * @property {OX.Services.Auth} Directories#
 * @property {OX.Services.Auth} Preferences#
 * @property {OX.Services.Auth} RecentCalls#
 */
OX.Connection = OX.Base.extend(/** @lends OX.Connection# */{
  services: {
    Auth: OX.Services.Auth,
    ActiveCalls: OX.Services.ActiveCalls,
    'ActiveCalls.Item': OX.Services.ActiveCalls.Item,
    Directories: OX.Services.Directories,
    Preferences: OX.Services.Preferences,
    RecentCalls: OX.Services.RecentCalls,
    UserAgents: OX.Services.UserAgents,
    Voicemail: OX.Services.Voicemail
  },

  /**
   * Initialize the service properties.
   */
  initConnection: function () {
    var serviceMap = {};

    for (var s in this.services) if (this.services.hasOwnProperty(s)) {
      var service = this.services[s];

      this[s] = service.extend({connection: this.connection});
      if (service.pubSubURI) {
        serviceMap[service.pubSubURI] = service;
      }
    }

    // Register for incoming messages.
    this.connection.registerHandler('message', function (msg) {
      var from = msg.getFrom();
    });

    return this;
  }
});
