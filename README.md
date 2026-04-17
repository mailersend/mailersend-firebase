# Send emails with MailerSend

**Author**: [MailerSend](https://www.mailersend.com)

**Description**: MailerSend is a transactional messaging service that enables developers to work faster and smarter.

An intuitively designed interface enables anyone to contribute to transactional email and SMS, while advanced sending infrastructure and flexible payment plans let you scale your sendings.

Built by deliverability experts, your messages always get delivered, along with dedicated IP, email verification and inbound routing for a comprehensive solution.

Get started right now for free!

**Details**: Use this extension to send emails that contain the information from documents added to a specified Cloud Firestore collection. Adding a document triggers this extension to send an email built from the document's fields.

Note that MailerSend allows you to:
- schedule emails
- send bulk emails
- add attachments up to 25MB
- organize your sendings with tags
- track opens, clicks, and spam reports.

We welcome [bug reports and feature requests](https://github.com/mailersend/mailersend-firebase/issues/new) as well as pull requests in this GitHub repository.

##### Table of Contents  

  * [🧩 Install this extension](#-install-this-extension)
    + [Console](#console)
    + [Firebase CLI](#firebase-cli)
  * [💪 Use the extension](#-use-the-extension)
    + [Send an email](#send-an-email)
    + [Additional setup](#additional-setup)
    + [Collection fields](#collection-fields)
    + [Send a bulk email](#send-a-bulk-email)
    + [Bulk email collection fields](#bulk-email-collection-fields)
    + [Email results](#email-results)
  * [💳 Billing](#-billing)
  * [⚙️ Configuration](#configuration)
    + [Configuration parameters](#configuration-parameters)
    + [Cloud Functions](#cloud-functions)
---

## 🧩 Install this extension

### Console

[![Install this extension in your Firebase project](https://www.gstatic.com/mobilesdk/210513_mobilesdk/install-extension.png "Install this extension in your Firebase project")][install-link]

[install-link]: https://console.firebase.google.com/project/_/extensions/install?ref=mailersend/mailersend-email

### Firebase CLI

```bash
firebase ext:install mailersend/mailersend-email --project=[your-project-id]
```

> Learn more about installing extensions in the Firebase Extensions documentation:
> [console](https://firebase.google.com/docs/extensions/install-extensions?platform=console),
> [CLI](https://firebase.google.com/docs/extensions/install-extensions?platform=cli)


## 💪 Use the extension

After its installation, this extension monitors all document writes to the `EMAIL_COLLECTION` collection. Email is sent based on the contents of the document's fields. The document's fields specify an email data.

### Send an email
<details>
<summary>Here's a basic example document write that would trigger this extension</summary>

```js
admin.firestore().collection('emails').add({
  to: [
    {
      email: 'recipient@example.com',
      name: 'Recipient name'
    }
  ],
  from: {
    email: 'from@example.com',
    name: 'From name'
  },
  cc: [
    {
      email: 'cc.recipient@example.com',
      name: 'CC recipient name'
    }
  ],
  bcc: [
    {
      email: 'bcc.recipient@example.com',
      name: 'Bcc recipient name'
    }
  ],
  subject: 'Hello from Firebase!',
  html: 'This is an <code>HTML</code> email body.',
  text: 'This is an TEXT email body.',
  template_id: 'abc123ced',
    personalization: [
      {
        email: 'recipient@example.com',
        data: {
          personalization_name: 'personalization value'
        }
      }
    ],
    tags: ['tag1', 'tag2'],
    reply_to: {
      email: 'reply_to@example.com',
        name: 'Reply to name'
    },
    in_reply_to: 'message-id@example.com',
    settings: {
      track_clicks: true,
      track_opens: true,
      track_content: true
    },
    headers: [
      {
        name: 'X-Custom-Header',
        value: 'custom-value'
      }
    ],
    send_at: '123465789'
})
```

</details>

### Send an email with attachments

<details>
<summary>Here's an example with a regular attachment and an inline image</summary>

```js
admin.firestore().collection('emails').add({
  to: [{ email: 'recipient@example.com', name: 'Recipient' }],
  from: { email: 'from@example.com', name: 'From name' },
  subject: 'Email with attachments',
  html: '<p>Please find the file attached.</p><p><img src="cid:company-logo" /></p>',
  text: 'Please find the file attached.',
  attachments: [
    {
      // Regular attachment — base64-encoded file content
      content: Buffer.from('Hello, World!').toString('base64'),
      filename: 'hello.txt',
      disposition: 'attachment'
    },
    {
      // Inline image — referenced in HTML via cid:<id>
      content: '<base64-encoded-image-content>',
      filename: 'logo.png',
      disposition: 'inline',
      id: 'company-logo'
    }
  ]
})
```

</details>

### Additional setup

Before installing this extension, set up the following Firebase service in your Firebase project:

- [Cloud Firestore](https://firebase.google.com/docs/firestore/quickstart) collection in your Firebase project.

Then, in the MailerSend dashboard:

- Add a [domain](https://app.mailersend.com/domains) and verify it editing your DNS records.
- Create a new [API token](https://app.mailersend.com/api-tokens) with full access.



### Collection fields

<details>
<summary>Find all the JSON field parameters you can add to your API call, provided in dot notation </summary>
<br>

| JSON field parameter                | Type       | Required | Limitations                                                       | Details                                                                                                                                                                                                       |
|-------------------------------------|------------|----------|-------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `from`                              | `object`   | yes *    |                                                                   | Not required if set in extension config or `template_id` is present and template has default sender set.                                                                                                      |
| `from.email`                        | `string`   | yes *    | Must be a verified domain or subdomain. | Not required if set in extension config or `template_id` is present and template has default sender set.                                                                                                      |
| `from.name`                         | `string`   | no       |                                                                   | `from.email` will be used if not provided or, if set in extension config or `template_id` is present with default values, the default subject from that will be used.                                         |
| `to`                                | `object[]` | yes      | Min `1`, max `50`                                                 |                                                                                                                                                                                                               |
| `to.*.email`                        | `string`   | yes      |                                                                   |                                                                                                                                                                                                               |
| `to.*.name`                         | `string`   | no       |                                                                   | The name of the recipient. May not contain `;` or `,`.                                                                                                                                                        |
| `cc`                                | `object[]` | no       | Max 10                                                            |                                                                                                                                                                                                               |
| `cc.*.email`                        | `string`   | yes      |                                                                   |                                                                                                                                                                                                               |
| `cc.*.name`                         | `string`   | no       |                                                                   | The name of the CC recipient. May not contain `;` or `,`.                                                                                                                                                     |
| `bcc`                               | `object[]` | no       | Max 10                                                            |                                                                                                                                                                                                               |
| `bcc.*.email`                       | `string`   | yes      |                                                                   |                                                                                                                                                                                                               |
| `bcc.*.name`                        | `string`   | no       |                                                                   | The name of the BCC recipient. May not contain `;` or `,`.                                                                                                                                                    |
| `reply_to`                          | `object`   | no       |                                                                   |                                                                                                                                                                                                               |
| `reply_to.email`                    | `string`   | no       |                                                                   | Can be set in extension config                                                                                                                                                                                |
| `reply_to.name`                     | `string`   | no       |                                                                   | Can be set in extension config                                                                                                                                                                                |
| `subject`                           | `string`   | yes *    |                                                                   | Not required if `template_id` is present and template has default subject set.                                                                                                                                |
| `text`                              | `string`   | yes *    | Max size of 2 MB.                                                 | Email represented in a text (`text/plain`) format. * Only required if there's no `html` or `template_id` present.                                                                                             |
| `html`                              | `string`   | yes *    | Max size of 2 MB.                                                 | Email represented in HTML (`text/html`) format. * Only required if there's no `text` or `template_id` present.                                                                                                |
| `template_id`                       | `string`   | yes *    |                                                                   | * Only required if there's no `text` or `html` present.                                                                                                                                                       |
| `tags`                              | `string[]` | no       |                                                                   | Limit is max 5 tags.                                                                                                                                                                                          |
| `personalization`                   | `object[]` | no       |                                                                   | Allows using personalization in <code v-pre>{{ var }}</code> syntax. Can be used in the `subject`, `html`, `text` fields. Read more about [advanced personalization](features.html#advanced-personalization). |
| `personalization.*.email`           | `string`   | yes      |                                                                   | Email address that personalization will be applied to.                                                                                                                                                        |
| `personalization.*.data`            | `object[]` | yes      |                                                                   | Object with `key: value` pairs. Values will be added to your template using <code v-pre>{{ key }}</code> syntax.                                                                                              |
| `in_reply_to`                       | `string`   | no       |                                                                   | Valid email address as per RFC 2821.                                                                                                                                                                          |
| `settings`                          | `object`   | no       |                                                                   |                                                                                                                                                                                                               |
| `settings.*`                        | `boolean`  | yes      |                                                                   | Can only contain the keys: `track_clicks`, `track_opens` and `track_content` and a boolean value of `true` or `false`.                                                                                        |
| `headers`                           | `object[]` | no       |                                                                   | Please note that this feature is available to Professional and Enterprise accounts only.                                                                                                                      |
| `headers.*.name`                    | `string`   | yes      | Must be alphanumeric which can contain `-`                        |                                                                                                                                                                                                               |
| `headers.*.value`                   | `string`   | yes      |                                                                   |                                                                                                                                                                                                               |
| `precedence_bulk`                   | `boolean`  | no       |                                                                   | This parameter will override domain's advanced settings.                                                                                                                                                     |
| `attachments`                       | `object[]` | no       |                                                                   |                                                                                                                                                                                                               |
| `attachments.*.content`             | `string`   | yes      | Max size of 25MB after decoding Base64.                           | Base64-encoded content of the attachment.                                                                                                                                                                     |
| `attachments.*.disposition`         | `string`   | yes      | Must be one of: `inline`, `attachment`                            | Use `inline` to make it accessible for content. Use `attachment` for normal attachments.                                                                                                                      |
| `attachments.*.filename`            | `string`   | yes      |                                                                   |                                                                                                                                                                                                               |
| `attachments.*.id`                  | `string`   | no       |                                                                   | Can be used in content as `<img src="cid:*"/>`. Must also set `attachments.*.disposition` to `inline`.                                                                                                        |
| `send_at`                           | `integer`  | no       | min: `now`, max: `now + 72hours`                                  | Has to be a [Unix timestamp](https://www.unixtimestamp.com/). **Please note that this timestamp is a minimal guarantee and that the email could be delayed due to server load.**                             |

</details>

### Send a bulk email

<details>
<summary>Here's an example document write to the bulk emails collection that would trigger a bulk send</summary>

```js
admin.firestore().collection('bulk_emails').add({
  emails: [
    {
      from: { email: 'hello@mailersend.com', name: 'MailerSend' },
      to: [{ email: 'john@mailersend.com', name: 'John Mailer' }],
      subject: 'Hello from {{company}}!',
      text: 'This is just a friendly hello from your friends at {{company}}.',
      html: '<b>This is just a friendly hello from your friends at {{company}}.</b>',
      personalization: [
        {
          email: 'john@mailersend.com',
          data: { company: 'MailerSend' }
        }
      ]
    },
    {
      from: { email: 'hello@mailersend.com', name: 'MailerSend' },
      to: [{ email: 'jane@mailersend.com', name: 'Jane Mailer' }],
      subject: 'Welcome to {{company}}!',
      text: 'This is a welcoming message from your friends at {{company}}.',
      html: '<b>This is a welcoming message from your friends at {{company}}.</b>',
      personalization: [
        {
          email: 'jane@mailersend.com',
          data: { company: 'MailerSend' }
        }
      ]
    }
  ]
})
```

</details>

### Bulk email collection fields

<details>
<summary>Find all the JSON field parameters for the bulk email collection</summary>

| JSON field parameter    | Type       | Required | Limitations                                                                                      | Details                                                                                 |
|-------------------------|------------|----------|--------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| `emails`                | `object[]` | yes      | Max 5 for Trial plan. Max 500 for Hobby, Starter, Professional or Enterprise plan accounts.      | Array of email objects to send in a single bulk request.                                |
| `emails.*`              | `object`   | yes      |                                                                                                  | Each item supports the same fields as a single email document (see Collection fields).  |

</details>

### Email results

After email sending is triggered this extension fills results into the `delivery` field.

| Field         | Description                                              |
|---------------|----------------------------------------------------------|
| error         | Validation error, or error from the server               |
| message_id    | Message ID in MailerSend system (single email only)      |
| bulk_email_id | Bulk email ID in MailerSend system (bulk email only)     |
| state         | State of an email sending: `ERROR`, `SUCCESS`            |


<!-- We recommend keeping the following section to explain how billing for Firebase Extensions works -->
## 💳 Billing

This extension uses other Firebase or Google Cloud Platform services which may have associated charges:

<!-- List all products the extension interacts with -->
- Cloud Functions

When you use Firebase Extensions, you're only charged for the underlying resources that you use. A paid-tier billing plan is only required if the extension uses a service that requires a paid-tier plan, for example calling to a Google Cloud Platform API or making outbound network requests to non-Google services. All Firebase services offer a free tier of usage. [Learn more about Firebase billing.](https://firebase.google.com/pricing)

This extension also uses the following third-party services:

- MailerSend ([pricing information](https://mailersend.com/pricing))

You are responsible for any costs associated with your use of these services.

## ⚙️Configuration

### Configuration Parameters

* Cloud Functions location: Where do you want to deploy the functions created for this extension? For help selecting a location, refer to the [location selection guide](https://firebase.google.com/docs/functions/locations).

* Emails documents collection: What is the path to the collection that contains the documents used to build and send the email?

* MailerSend API key: API tokens are used for authentication when sending emails. You can find more details how to create an API token [here](https://www.mailersend.com/help/managing-api-tokens).
* Email parameters:

    + Default FROM email address: The email address to use as the sender's address (if it's not specified in the added email document or template).

    + Default FROM name: The name to use as the sender's name.

    + Default reply to email address: The email address to use as the reply to address (if it's not specified in the added email document or template).(not required)

    + Default reply to name: The name to use as the reply to name. (not required)

    + Default template ID: The default template id to use for emails (it will be used if not specified in the added email document).

    + Bulk emails documents collection: The path to the collection that contains the documents used to build and send bulk emails. Defaults to `bulk_emails`.



### Cloud Functions

* processDocumentCreated: Processes created document in Cloud Firestore collection, sends an email and updates status information.

* processBulkDocumentCreated: Processes created document in the bulk emails Cloud Firestore collection, sends a bulk email and updates status information.
