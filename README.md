# Send email with MailerSend

**Author**: MailerSend (**[https://www.mailersend.com](https://www.mailersend.com)**)

**Description**: Send transactional emails using MailerSend.



**Details**: Use this extension to send emails that contain the information from documents added to a specified Cloud Firestore collection.

Adding a document triggers this extension to send an email built from the document's fields.

Here's a basic example document write that would trigger this extension:

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
    variables: [
      {
        email: 'recipient@example.com',
        substitutions: [
          {
            var: 'variable_name',
            value: 'variable value'
          }
        ]
      }
    ],
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
    send_at: '123465789'
})
```
# Using the extension

After its installation, this extension monitors all document writes to the `EMAIL_COLLECTION` collection. Email is sent based on the contents of the document's fields. The document's fields specify an email data.

#### Collection fields

_JSON parameters are provided in dot notation_

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
| `variables`                         | `object[]` | no       |                                                                   | These will be replaced in the email content using `{$var}` format. Can be used in the `subject`, `html`, `text` fields.                                                                                       |
| `variables.*.email`                 | `string`   | yes      |                                                                   | Email address that substitutions will be applied to. Read more about [simple personalization](features.html#simple-personalization).                                                                          |
| `variables.*.substitutions`         | `object[]` | yes      |                                                                   |                                                                                                                                                                                                               |
| `variables.*.substitutions.*.var`   | `string`   | yes      |                                                                   | Name of the variable, will replace `{$var}` in the `subject`, `html`, `text` fields.                                                                                                                          |
| `variables.*.substitutions.*.value` | `string`   | yes      |                                                                   | Value to be replaced, based on the `variables.*.substitutions.*.var`  name.                                                                                                                                   |
| `personalization`                   | `object[]` | no       |                                                                   | Allows using personalization in <code v-pre>{{ var }}</code> syntax. Can be used in the `subject`, `html`, `text` fields. Read more about [advanced personalization](features.html#advanced-personalization). |
| `personalization.*.email`           | `string`   | yes      |                                                                   | Email address that personalization will be applied to.                                                                                                                                                        |
| `personalization.*.data`            | `object[]` | yes      |                                                                   | Object with `key: value` pairs. Values will be added to your template using <code v-pre>{{ key }}</code> syntax.                                                                                              |
| `send_at`                           | `integer`  | no       | min: `now`, max: `now + 72hours`                                  | Has to be a [Unix timestamp](https://www.unixtimestamp.com/). **Please note that this timestamp is a minimal guarantee and that the email could be delayed due to server load.**                              |

#### Email results

After email sending is triggered this extension fills results into `delivery` field.

| Field      | Description                                    |
|------------|------------------------------------------------|
| error      | Validation error, or error from the server     |
| message_id | Message ID in MailerSend system                |
| state      | State of an email sending: `ERROR`, `SUCCESS`  |


<!-- We recommend keeping the following section to explain how billing for Firebase Extensions works -->
# Billing

This extension uses other Firebase or Google Cloud Platform services which may have associated charges:

<!-- List all products the extension interacts with -->
- Cloud Functions

When you use Firebase Extensions, you're only charged for the underlying resources that you use. A paid-tier billing plan is only required if the extension uses a service that requires a paid-tier plan, for example calling to a Google Cloud Platform API or making outbound network requests to non-Google services. All Firebase services offer a free tier of usage. [Learn more about Firebase billing.](https://firebase.google.com/pricing)




**Configuration Parameters:**

* Cloud Functions location: Where do you want to deploy the functions created for this extension? For help selecting a location, refer to the [location selection guide](https://firebase.google.com/docs/functions/locations).

* Emails documents collection: What is the path to the collection that contains the documents used to build and send the email?

* MailerSend API key: API tokens are used for authentication when sending emails. You can find more details how to create MailerSend API token [here](https://www.mailersend.com/help/managing-api-tokens).

* Default FROM email address: The email address to use as the sender's address (if it's not specified in the added email document or template).

* Default FROM name: The name to use as the sender's name.

* Default reply to email address: The email address to use as the reply to address (if it's not specified in the added email document or template).

* Default reply to name: The name to use as the reply to name.

* Default template ID: The default template id to use for emails (it will be used if not specified in the added email document).



**Cloud Functions:**

* **processDocumentCreated:** Processes created document in Cloud Firestore collection, sends an email and updates status information.
