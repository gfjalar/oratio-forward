const SparkPost = require('sparkpost');
const functions = require('firebase-functions');
const moment = require('moment');

const SPARKPOST_KEY = functions.config().sparkpost.key;
const ADDRESS_KEY = functions.config().address.key;
const DATETIME_FORMAT = functions.config().datetime.format;

const sparkpost = new SparkPost(SPARKPOST_KEY);

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
    return moment(this.json.message.createdAt, "x").format(DATETIME_FORMAT);
  }

  createTransmission(address) {
    return {
      content: {
        from: {
          name: this.json.conversation.name,
          email: `${this.json.conversation.id}@orat.io`
        },
        subject: `${this.json.account.name}: ${this.json.conversation.name}`,
        html: `<html>
          <style type="text/css">
            .content {
              width: 100%;
              padding: 2rem;
              border-style: solid;
              border-width: 0.1rem;
              border-radius: 1rem;
            }
            .unassigned {
              background: #eb5b4d;
              border-color: #9f9a99;
            }
            .new, .in-progress {
              background: #1e96c8;
              border-color: #6e7578;
            }
            .closed, .automated {
              background: #27ae60;
              border-color: #696c6a;
            }
          </style>
          <body>
            <p><b>${this.from}</b> said:</p>
            <p class="content ${this.json.conversation.status}">${this.content}</p>
            <p align="right"><small>${this.datetime}</small></p>
            <hr>
            <p><i>View the conversation at <a href="https://app.orat.io/#/conversations?status=${this.json.conversation.status}&id=${this.json.conversation.id}">orat.io</a></i></p>
          </body>
        </html>`
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
  sparkpost.transmissions.send(payload.createTransmission(address))
    .then(console.log)
    .catch(console.err);
};

exports.message = functions.https.onRequest(handleMessage);
