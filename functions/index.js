/*
 * This template contains a HTTP function that
 * responds with a greeting when called
 *
 * Reference PARAMETERS in your functions code with:
 * `process.env.<parameter-name>`
 * Learn more about building extensions in the docs:
 * https://firebase.google.com/docs/extensions/alpha/overview
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

const Recipient = require("mailersend").Recipient;
const EmailParams = require("mailersend").EmailParams;
const Sender = require("mailersend").Sender;
const Attachment = require("mailersend").Attachment;
const MailerSend = require("mailersend").MailerSend;

let config = require("./config");
const logs = require("./logs");

let initialized = false;
let mailersend = null;

const initialize = () => {
  if (initialized === true) return;
  initialized = true;
  admin.initializeApp();
  admin.firestore().settings({ ignoreUndefinedProperties: true });
  mailersend = new MailerSend({
    apiKey: config.mailersendApiToken,
  });
};

const buildEmailParams = (data) => {
  let toRecipients = [];
  if (Array.isArray(data.to)) {
    data.to.forEach((recipient) => {
      toRecipients.push(new Recipient(recipient.email, recipient.name));
    });
  }

  let ccRecipients = [];
  if (Array.isArray(data.cc)) {
    data.cc.forEach((recipient) => {
      ccRecipients.push(new Recipient(recipient.email, recipient.name));
    });
  }

  let bccRecipients = [];
  if (Array.isArray(data.bcc)) {
    data.bcc.forEach((recipient) => {
      bccRecipients.push(new Recipient(recipient.email, recipient.name));
    });
  }

  const sentFrom = new Sender(data.from.email, data.from.name);

  let emailParams = new EmailParams();

  emailParams.setFrom(sentFrom);
  emailParams.setTo(toRecipients);

  if (ccRecipients.length) {
    emailParams.setCc(ccRecipients);
  }

  if (bccRecipients.length) {
    emailParams.setBcc(bccRecipients);
  }

  if (data.subject) {
    emailParams.setSubject(data.subject);
  }

  if (data.html) {
    emailParams.setHtml(data.html);
  }

  if (data.text) {
    emailParams.setText(data.text);
  }

  if (data.template_id) {
    emailParams.setTemplateId(data.template_id);
  }

  if (data.personalization) {
    emailParams.setPersonalization(data.personalization);
  }

  if (data.tags && data.tags.length) {
    emailParams.setTags(data.tags);
  }

  if (data.reply_to && data.reply_to.email) {
    const replyTo = new Sender(data.reply_to.email, data.reply_to.name);
    emailParams.setReplyTo(replyTo);
  }

  if (data.send_at) {
    emailParams.setSendAt(data.send_at);
  }

  if (data.in_reply_to) {
    emailParams.setInReplyTo(data.in_reply_to);
  }

  if (data.settings) {
    emailParams.setSettings(data.settings);
  }

  if (Array.isArray(data.headers) && data.headers.length) {
    emailParams.headers = data.headers;
  }

  if (data.precedence_bulk) {
    emailParams.setPrecedenceBulk(data.precedence_bulk);
  }

  if (data.list_unsubscribe) {
    emailParams.setListUnsubscribe(data.list_unsubscribe);
  }

  if (Array.isArray(data.attachments) && data.attachments.length) {
    const attachments = data.attachments.map(
      (a) => new Attachment(a.content, a.filename, a.disposition || "attachment", a.id)
    );
    emailParams.setAttachments(attachments);
  }

  return emailParams;
};

const send = async (data) => {
  const emailParams = buildEmailParams(data);

  return await mailersend.email
    .send(emailParams)
    .then(async (response) => {
      if (response.statusCode === 202) {
        return {
          status: 202,
          messageId: (response.headers && response.headers["x-message-id"]) || "",
          warnings: (response.body && response.body.warnings) || [],
        };
      }

      if (response.statusCode === 422) {
        return {
          status: 422,
          message: (response.data && response.data.message) || "",
        };
      }

      if (response.statusCode === 429) {
        return {
          status: 429,
          message: (response.data && response.data.message) || "",
        };
      }

      throw new Error("Something went wrong.");
    })
    .catch((error) => {
      const errorBody = error.body;

      return {
        status: error.statusCode,
        message: errorBody || "",
      };
    });
};

const sendBulk = async (data) => {
  const emailParamsArray = data.emails.map((emailData) => {
    const prepared = prepareData({ ...emailData });
    return buildEmailParams(prepared);
  });

  return await mailersend.email
    .sendBulk(emailParamsArray)
    .then((response) => ({
      status: response.statusCode,
      bulkEmailId: response.body?.bulk_email_id || "",
    }))
    .catch((error) => ({
      status: error.statusCode,
      message: error.body || "",
    }));
};

const prepareData = (data) => {
  data.from = data.from || {};
  data.reply_to = data.reply_to || {};

  data.from.email = data.from.email || config.defaultFromEmail;
  data.from.name = data.from.name || config.defaultFromName;
  data.reply_to.email = data.reply_to.email || config.defaultReplyToEmail;
  data.reply_to.name = data.reply_to.name || config.defaultReplyToName;

  if (!data.html && !data.text) {
    data.template_id = data.template_id || config.defaultTemplateId;
  }

  if (!data.html && !data.text && !data.template_id) {
    throw new Error(
      "Failed to send email. At least one of html, text and template_id should be set."
    );
  }

  if (!Array.isArray(data.to) || !data.to.length) {
    throw new Error("Failed to deliver email. Expected at least 1 recipient.");
  }

  if (Array.isArray(data.headers)) {
    data.headers.forEach((header, index) => {
      if (!header.name || !header.value) {
        throw new Error(
          `Failed to send email. Each header must have a name and value. Please check header at index ${index}.`
        );
      }
    });
  }

  return data;
};

exports.processDocumentCreated = onDocumentCreated(
  `${config.emailCollection}/{documentId}`,
  async (event) => {
    logs.start();
    initialize();

    const snapshot = event.data;

    if (!snapshot) {
      logs.error("No data associated with the event");
      return;
    }

    let data = snapshot.data();
    const update = {
      "delivery.error": null,
      "delivery.message_id": null,
    };

    try {
      data = prepareData(data);

      const result = await send(data);
      if (result.status === 202) {
        update["delivery.state"] = "SUCCESS";
        update["delivery.message_id"] = result.messageId || "";
        if (result.warnings && result.warnings.length) {
          update["delivery.warnings"] = result.warnings;
        }
      } else {
        update["delivery.state"] = "ERROR";
        update["delivery.error"] = result.message;
      }
    } catch (e) {
      update["delivery.state"] = "ERROR";
      update["delivery.error"] = e.toString();
      logs.error(e);
    }

    await snapshot.ref.update(update);

    logs.end(update);
  }
);

exports.processBulkDocumentCreated = onDocumentCreated(
  `${config.bulkEmailCollection}/{documentId}`,
  async (event) => {
    logs.start();
    initialize();

    const snapshot = event.data;

    if (!snapshot) {
      logs.error("No data associated with the event");
      return;
    }

    const data = snapshot.data();
    const update = {
      "delivery.error": null,
      "delivery.bulk_email_id": null,
    };

    try {
      if (!Array.isArray(data.emails) || !data.emails.length) {
        throw new Error("Failed to send bulk email. Expected at least 1 email in the emails array.");
      }

      const result = await sendBulk(data);
      if (result.status === 202) {
        update["delivery.state"] = "SUCCESS";
        update["delivery.bulk_email_id"] = result.bulkEmailId || "";
      } else {
        update["delivery.state"] = "ERROR";
        update["delivery.error"] = result.message;
      }
    } catch (e) {
      update["delivery.state"] = "ERROR";
      update["delivery.error"] = e.toString();
      logs.error(e);
    }

    await snapshot.ref.update(update);

    logs.end(update);
  }
);
