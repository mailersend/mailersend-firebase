/*
 * This template contains a HTTP function that
 * responds with a greeting when called
 *
 * Reference PARAMETERS in your functions code with:
 * `process.env.<parameter-name>`
 * Learn more about building extensions in the docs:
 * https://firebase.google.com/docs/extensions/alpha/overview
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const Recipient = require("mailersend").Recipient;
const EmailParams = require("mailersend").EmailParams;
const Sender = require("mailersend").Sender;
const MailerSend = require("mailersend").MailerSend;

let config = require('./config');
const logs = require('./logs');

let initialized = false;
let mailersend = null;

const initialize = () => {
  if (initialized === true) return;
  initialized = true;
  admin.initializeApp();
  admin.firestore().settings({ignoreUndefinedProperties:true});
  mailersend = new MailerSend({
    apiKey: config.mailersendApiToken,
  })
}

const send = async (data) => {

  let toRecipients = [];
  if (Array.isArray(data.to)) {
    data.to.forEach((recipient) => {
      toRecipients.push(new Recipient(recipient.email, recipient.name))
    })
  }

  let ccRecipients = [];
  if (Array.isArray(data.cc)) {
    data.cc.forEach((recipient) => {
      ccRecipients.push(new Recipient(recipient.email, recipient.name))
    })
  }

  let bccRecipients = [];
  if (Array.isArray(data.bcc)) {
    data.bcc.forEach((recipient) => {
      bccRecipients.push(new Recipient(recipient.email, recipient.name))
    })
  }

  const sentFrom = new Sender(data.from.email, data.from.name);

  let emailParams = new EmailParams()

  emailParams.setFrom(sentFrom)
  emailParams.setTo(toRecipients)

  if (ccRecipients.length) {
    emailParams.setCc(ccRecipients)
  }

  if (bccRecipients.length) {
    emailParams.setBcc(bccRecipients)
  }

  if (data.subject) {
    emailParams.setSubject(data.subject)
  }

  if (data.html) {
    emailParams.setHtml(data.html)
  }

  if (data.text) {
    emailParams.setText(data.text)
  }

  if (data.template_id) {
    emailParams.setTemplateId(data.template_id)
  }

  if (data.variables) {
    emailParams.setVariables(data.variables);
  }

  if (data.personalization) {
    emailParams.setPersonalization(data.personalization);
  }

  if (data.tags && data.tags.length) {
    emailParams.setTags(data.tags)
  }

  if (data.reply_to && data.reply_to.email) {
    const replyTo = new Sender(data.reply_to.email, data.reply_to.name);
    emailParams.setReplyTo(replyTo)
  }

  if (data.send_at) {
    emailParams.setSendAt(data.send_at)
  }

  return await mailersend.email.send(emailParams)
      .then(async (response) => {
        if (response.statusCode === 202) {
          return {
            status: 202,
            messageId: response.headers && response.headers['x-message-id'] || ''
          };
        }

        if (response.statusCode === 422) {
          return {
            status: 422,
            message: response.data && response.data.message || ''
          };
        }

        if (response.statusCode === 429) {
          return {
            status: 429,
            message: response.data && response.data.message || ''
          };
        }

        throw new Error('Something went wrong.');
      }).catch((error) => {
        const errorBody = error.body

        return {
          status: error.status,
          message: errorBody || ''
        };
      })
}

const prepareData = (data) => {
  data.from = data.from || {}
  data.reply_to = data.reply_to || {}

  data.from.email = data.from.email || config.defaultFromEmail
  data.from.name = data.from.name || config.defaultFromName
  data.reply_to.email = data.reply_to.email || config.defaultReplyToEmail
  data.reply_to.name = data.reply_to.name || config.defaultReplyToName

  if (!data.html && !data.text) {
    data.template_id = data.template_id || config.defaultTemplateId
  }

  if (!data.html && !data.text && !data.template_id) {
    throw new Error(
        "Failed to send email. At least one of html, text and template_id should be set."
    );
  }

  if (!Array.isArray(data.to) || !data.to.length) {
    throw new Error(
        "Failed to deliver email. Expected at least 1 recipient."
    );
  }

  return data
}

exports.processDocumentCreated = functions.firestore.document(config.emailCollection).onCreate(async (snapshot) => {
  logs.start()
  initialize()

  let data = snapshot.data()
  const update = {
    "delivery.error": null,
    "delivery.message_id": null,
  };

  try {
    data = prepareData(data)

    const result = await send(data);
    if (result.status === 202) {
      update["delivery.state"] = "SUCCESS";
      update["delivery.message_id"] = result.messageId || '';
    } else {
      update["delivery.state"] = "ERROR";
      update["delivery.error"] = result.message;
    }
  } catch (e) {
    update["delivery.state"] = "ERROR";
    update["delivery.error"] = e.toString();
    logs.error(e);
  }

  await snapshot.ref.update(update)

  logs.end(update)
})
