const SparkPost = require('sparkpost');
const Giphy = require('giphy');
const functions = require('firebase-functions');
const moment = require('moment');

const SPARKPOST_KEY = functions.config().sparkpost.key;
const GIPHY_KEY = functions.config().giphy.key;
const ADDRESS_KEY = functions.config().address.key;
const DATETIME_FORMAT = functions.config().datetime.format;

const sparkpost = new SparkPost(SPARKPOST_KEY);
const giphy = new Giphy(GIPHY_KEY);

class Payload {
  constructor(json) {
    this.json = json;
  }

  isSubscriber() {
    return this.json.message.sender === 'subscriber';
  }

  isAccount() {
    return this.json.message.sender === 'account';
  }

  get from() {
    if (this.isSubscriber())
      return this.json.conversation.name;
    if (this.isAccount()) {
      try {
        return this.json.conversation.users[0].name;
      } catch(e) {
        return 'An Agent';
      }
    }
    return 'Someone';
  }

  get content() {
    switch (this.json.message.type) {
      case 'text':
        return this.json.message.content.text || this.json.message.content;
      case 'audio':
      case 'document':
      case 'image':
      case 'video':
        return this.json.message.content.file || this.json.message.content;
      default:
        console.log(`${this.json.message.type}: ${this.json.message.content}`);
        return 'Something';
    }
  }

  get datetime() {
    return moment(this.json.message.created_at, 'x').format(DATETIME_FORMAT);
  }

  get color() {
    switch (this.json.conversation.status) {
      case 'unassigned':
        return '#eb5b4d';
      case 'new':
      case 'in-progress':
      case 'inbox':
        return '#1e96c8';
      case 'closed':
      case 'automated':
        return '#27ae60'
    }
  }

  createTransmission(address, url) {
    return {
      content: {
        from: {
          name: this.json.conversation.name,
          email: `${this.json.conversation.id}@orat.io`
        },
        subject: `${this.json.account.name}: ${this.json.conversation.name}`,
        text: `${this.from} said:\n\n${this.content}\n\n${this.datetime}\n\nView the cconversation at https://app.orat.io/#/conversations?status=${this.json.conversation.status}&id=${this.json.conversation.id}`,
        html: `
          <p><b>${this.from}</b> said:</p>
          <p style="padding: 2rem; border-style: solid; border-width: 0.1rem; border-radius: 1rem; border-color: ${this.color}">${this.content}</p>
          <p align="right"><small>${this.datetime}</small></p>
          <hr>
          <p><i>View the conversation at <a href="https://app.orat.io/#/conversations?status=${this.json.conversation.status}&id=${this.json.conversation.id}">orat.io</a></i></p>
          <hr>
          <p align="middle"><img src="${url}" alt="Silicon Valley Hot Dog" border="0"></p>
        `
      },
      recipients: [{
        address: address
      }]
    }
  }
}

const handleMessage = (request, response) => {
  response.status(200).end();

  const payload = new Payload(request.body);
  const address = request.get(ADDRESS_KEY);
  giphy.random({ tag: 'silicon valley hot dog'}, (e, gif) => {
    const url = gif && gif.data && gif.data.image_url ? gif.data.image_url : 'https://media.giphy.com/media/3ohzdXIKl0BjNK2g3m/giphy.gif';
    sparkpost.transmissions.send(payload.createTransmission(address, url))
      .then(console.log)
      .catch(console.err);
  });
};

exports.message = functions.https.onRequest(handleMessage);
