OXTest.Voicemail = new YAHOO.tool.TestCase({
  name: 'Voicemail Tests',

  setUp: function () {
    this.conn = OXTest.ConnectionMock.extend();
    this.ox = OX.Connection.extend({connectionAdapter: this.conn});
    this.Voicemail = this.ox.Voicemail;
  },

  tearDown: function () {
    delete this.conn;
    delete this.ox;
    delete this.Voicemail;
  },

  testServiceMixin: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isObject(OX.Service.Voicemail,
                    'Voicemail mixin is not available');
    Assert.isObject(this.Voicemail, 'Voicemail is not initialized');
    Assert.areSame(this.ox,         this.ox.Voicemail.connection);
  },

  testPubSubURI: function () {
    var Assert = YAHOO.util.Assert;

    Assert.areSame('xmpp:pubsub.voicemail.xmpp.onsip.com',
                   this.Voicemail.pubSubURI.toString(),
                   'Voicemail.pubSub URI is wrong.');
  },

  testItemFromElement: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.Voicemail.itemFromElement,
                      'Voicemail service cannot turn packet into item.');

    var element = OXTest.DOMParser.parse('<item id="9f921c83b50f47e781920f2627019064"><voicemail xmlns="onsip:voicemail"><mailbox>1</mailbox><caller-id>"Steve" &lt;steve&gt;</caller-id><created>2009-03-04T13:24:01-05:00</created><duration>2</duration><labels><label>INBOX</label></labels></voicemail></item>');
    var item = this.Voicemail.itemFromElement(element.doc);
    Assert.isObject(item, 'Voicemail.itemFromElement did not return an object.');
    Assert.areSame(this.ox, item.connection,
                   'Voicemail item connection is wrong.');
    Assert.areSame(1, item.mailbox, 'Mailbox is wrong.');
    Assert.areSame('"Steve" <steve>', item.callerID, 'Caller ID is wrong.');
    Assert.areSame('2009-03-04T13:24:01-05:00', item.created,
                   'Created time is wrong.');
    Assert.areSame(2, item.duration, 'Duration is wrong.');
    Assert.isArray(item.labels, 'Labels is not an array.');
    Assert.areSame(1, item.labels.length, 'Wrong number of labels.');
    Assert.areSame('INBOX', item.labels[0], 'Label is wrong.');
  },

  testLabelItemFromElement: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isFunction(this.Voicemail.itemFromElement,
                      'Voicemail service cannot turn packet into item.');
    var element = OXTest.DOMParser.parse('<item id="labels"><labels xmlns="onsip:voicemail"><label>Family</label><label>INBOX</label></labels></item>');

    var item = this.Voicemail.itemFromElement(element.doc);
    Assert.isObject(item, 'Voicemail.itemFromElement did not return an object.');
    Assert.isArray(item.labels, 'Labels is not an array.');
    Assert.areSame(2, item.labels.length, 'Wrong number of labels.');
    Assert.areSame('Family', item.labels[0], 'Wrong first label.');
    Assert.areSame('INBOX', item.labels[1], 'Wrong second label.');
  },

  testMailbox: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.Voicemail.Item.mailbox,
                          'Voicemail.Item.mailbox is undefined');
  },

  testCallerID: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.Voicemail.Item.callerID,
                          'Voicemail.Item.callerID is undefined');
  },

  testCreated: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.Voicemail.Item.created,
                          'Voicemail.Item.created is undefined');
  },

  testDuration: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.Voicemail.Item.duration,
                          'Voicemail.Item.duration is undefined');
  },

  testLabels: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.Voicemail.Item.labels,
                          'Voicemail.Item.labels is undefined');
  },

  testLabelItem: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(this.Voicemail.LabelItem.labels,
                          'Voicemail.LabelItem.labels is undefined');
  }
});

YAHOO.tool.TestRunner.add(OXTest.Voicemail);
