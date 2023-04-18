<!-- 
This file provides your users an overview of how to use your extension after they've installed it. All content is optional, but this is the recommended format. Your users will see the contents of this file in the Firebase console after they install the extension.

Include instructions for using the extension and any important functional details. Also include **detailed descriptions** for any additional post-installation setup required by the user.

Reference values for the extension instance using the ${param:PARAMETER_NAME} or ${function:VARIABLE_NAME} syntax.
Learn more in the docs: https://firebase.google.com/docs/extensions/alpha/create-user-docs#reference-in-postinstall

Learn more about writing a POSTINSTALL.md file in the docs:
https://firebase.google.com/docs/extensions/alpha/create-user-docs#writing-postinstall
-->

# See it in action

Use this extension to send emails that contain the information from documents added to a specified Cloud Firestore collection.

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

### Collection fields

JSON field parameters you can add to your API call, provided in dot notation
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
| `variables`                         | `object[]` | no       |                                                                   | These will be replaced in the email content using `{$var}` format. Can be used in the `subject`, `html`, `text` fields.                                                                                       |
| `variables.*.email`                 | `string`   | yes      |                                                                   | Email address that substitutions will be applied to. Read more about [simple personalization](features.html#simple-personalization).                                                                          |
| `variables.*.substitutions`         | `object[]` | yes      |                                                                   |                                                                                                                                                                                                               |
| `variables.*.substitutions.*.var`   | `string`   | yes      |                                                                   | Name of the variable, will replace `{$var}` in the `subject`, `html`, `text` fields.                                                                                                                          |
| `variables.*.substitutions.*.value` | `string`   | yes      |                                                                   | Value to be replaced, based on the `variables.*.substitutions.*.var`  name.                                                                                                                                   |
| `personalization`                   | `object[]` | no       |                                                                   | Allows using personalization in <code v-pre>{{ var }}</code> syntax. Can be used in the `subject`, `html`, `text` fields. Read more about [advanced personalization](features.html#advanced-personalization). |
| `personalization.*.email`           | `string`   | yes      |                                                                   | Email address that personalization will be applied to.                                                                                                                                                        |
| `personalization.*.data`            | `object[]` | yes      |                                                                   | Object with `key: value` pairs. Values will be added to your template using <code v-pre>{{ key }}</code> syntax.                                                                                              |
| `send_at`                           | `integer`  | no       | min: `now`, max: `now + 72hours`                                  | Has to be a [Unix timestamp](https://www.unixtimestamp.com/). **Please note that this timestamp is a minimal guarantee and that the email could be delayed due to server load.**                             |



#### Email results

After email sending is triggered this extension fills results into `delivery` field.

| Field      | Description                                    |
|------------|------------------------------------------------|
| error      | Validation error, or error from the server     |
| message_id | Message ID in MailerSend system                |
| state      | State of an email sending: `ERROR`, `SUCCESS`  |


# Monitoring

As a best practice, you can [monitor the activity](https://firebase.google.com/docs/extensions/manage-installed-extensions#monitor) of your installed extension, including checks on its health, usage, and logs.
