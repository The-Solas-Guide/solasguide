import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";

export async function sendTransactionalEmail(
  to: Recipient[],
  subject: string,
  text: string,
  replyTo?: Recipient,
) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const fromEmail = process.env.MAILERSEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) throw new Error("MailerSend is not configured");

  const params = new EmailParams()
    .setFrom(new Sender(fromEmail, process.env.MAILERSEND_FROM_NAME || "The Solas Guide"))
    .setTo(to)
    .setSubject(subject)
    .setText(text);
  if (replyTo) params.setReplyTo(replyTo);

  await new MailerSend({ apiKey }).email.send(params);
}
