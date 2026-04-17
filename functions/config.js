module.exports = {
    emailCollection: process.env.EMAIL_COLLECTION,
    bulkEmailCollection: process.env.BULK_EMAIL_COLLECTION || "bulk_emails",
    mailersendApiToken: process.env.MAILERSEND_API_KEY,
    defaultFromEmail: process.env.DEFAULT_FROM_EMAIL,
    defaultFromName: process.env.DEFAULT_FROM_NAME,
    defaultReplyToEmail: process.env.DEFAULT_REPLY_TO_EMAIL,
    defaultReplyToName: process.env.DEFAULT_REPLY_TO_NAME,
    defaultTemplateId: process.env.DEFAULT_TEMPLATE_ID,
};