<!-- 
This file provides your users an overview of how to use your extension after they've installed it. All content is optional, but this is the recommended format. Your users will see the contents of this file in the Firebase console after they install the extension.

Include instructions for using the extension and any important functional details. Also include **detailed descriptions** for any additional post-installation setup required by the user.

Reference values for the extension instance using the ${param:PARAMETER_NAME} or ${function:VARIABLE_NAME} syntax.
Learn more in the docs: https://firebase.google.com/docs/extensions/alpha/create-user-docs#reference-in-postinstall

Learn more about writing a POSTINSTALL.md file in the docs:
https://firebase.google.com/docs/extensions/alpha/create-user-docs#writing-postinstall
-->
##### Table of Contents  

  * [💪 Use the extension](#-use-the-extension)
    + [Send an email](#send-an-email)
    + [Collection fields](#collection-fields)
    + [Send a bulk email](#send-a-bulk-email)
    + [Bulk email collection fields](#bulk-email-collection-fields)
    + [Email results](#email-results)
  * [👀 Monitoring](#-monitoring)

---

## 💪 Use the extension

Use this extension to send emails that contain the information from documents added to a specified Cloud Firestore collection.

After its installation, this extension monitors all document writes to the `EMAIL_COLLECTION` collection. Email is sent based on the contents of the document's fields. The document's fields specify an email data. Adding a document triggers this extension to send an email built from the document's fields.


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


### Collection fields

<details>
<summary>Find all the JSON field parameters you can add to your API call, provided in dot notation </summary>


| JSON field parameter                | Type       | Required | Limitations                                                       | Details                                                                                                                                                                                                       |
|-------------------------------------|------------|----------|-------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `from`                              | `object`   | yes *    |                                                                   | Not required if set in extension config or `template_id` is present and template has default sender set.                                                                                                      |
| `from.email`                        | `string`   | yes *    | Must be a verified domain or a subdomain from a verified domain . | Not required if set in extension config or `template_id` is present and template has default sender set.                                                                                                      |
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
| `in_reply_to`                       | `string`   | no       |                                                                   | Valid email address as per RFC 2821.                                                                                                                                                                  |
| `settings`                          | `object`   | no       |                                                                   |                                                                                                                                                                                                               |
| `settings.*`                        | `boolean`  | yes      |                                                                   | Can only contain the keys: `track_clicks`, `track_opens` and `track_content` and a boolean value of `true` or `false`.                                                                                        |
| `headers`                           | `object[]` | no       |                                                                   | Please note that this feature is available to Professional and Enterprise accounts only.                                                                                                                      |
| `headers.*.name`                    | `string`   | yes      | Must be alphanumeric which can contain `-`                        |                                                                                                                                                                                                               |
| `headers.*.value`                   | `string`   | yes      |                                                                   |                                                                                                                                                                                                               |
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



## 👀 Monitoring

As a best practice, you can [monitor the activity](https://firebase.google.com/docs/extensions/manage-installed-extensions#monitor) of your installed extension, including checks on its health, usage, and logs.
